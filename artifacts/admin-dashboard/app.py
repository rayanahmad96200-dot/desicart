import os
import uuid
import sqlite3
from functools import wraps
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, g
)
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'desicart-admin-secret-2024')

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'desicart2024')

DATABASE = os.path.join(app.root_path, 'products.db')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def init_db():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                original_price REAL,
                category TEXT,
                badge TEXT,
                image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        count = db.execute('SELECT COUNT(*) FROM products').fetchone()[0]
        if count == 0:
            sample_products = [
                ('Ultra 3 Smart Watch', '7-in-1 Edition luxury smart watch with 7 interchangeable straps, SpO2 monitor, heart rate sensor, and IP68 waterproofing.', 4999, 9999, 'Smart Watches', 'Best Seller', None),
                ('AirPods Pro 2', 'Active Noise Cancellation earbuds with spatial audio, transparency mode, and 30-hour battery life.', 3499, 6999, 'Earbuds', 'Trending', None),
                ('KTS-1185 Speaker', 'Portable Bluetooth speaker with RGB lighting, 360 surround sound, 10-hour battery, and IPX5 waterproofing.', 2499, 4999, 'Speakers', 'Hot Pick', None),
                ('Power Bank 10000mAh', 'Slim 10000mAh power bank with dual USB output, LED indicator, and fast charging support.', 1999, 3999, 'Power Banks', 'New', None),
                ('AKG Handsfree', 'Crystal-clear audio handsfree with built-in mic, tangle-free cable, and universal 3.5mm jack.', 799, 1499, 'Accessories', None, None),
                ('Solar Bluetooth Speaker', 'Eco-friendly solar-powered Bluetooth speaker with built-in solar panel, waterproof design, and 20-hour playtime.', 3299, 5999, 'Speakers', 'Eco Pick', None),
                ('Portable AC Cooling Fan', 'Beat the heat with this ultra-portable 3-in-1 personal air cooler, humidifier, and air purifier with built-in water tank.', 1999, 4500, 'Accessories', 'Summer Deal', None),
                ('10000mAh Slim Power Bank', 'Ultra-slim transparent power bank with digital LED display showing charge percentage and output voltage.', 1999, 3999, 'Power Banks', 'New', None),
                ('20000mAh Transparent Power Bank', '66W blazing-fast PD charging power bank with see-through body revealing the internal circuit board.', 3499, 7000, 'Power Banks', 'Trending', None),
                ('P9 Wireless Headphones', 'Premium over-ear wireless Bluetooth 5.0 headphones with active noise cancellation and 40-hour battery life.', 1499, 2999, 'Headphones', 'Hot Pick', None),
            ]
            db.executemany(
                'INSERT INTO products (title, description, price, original_price, category, badge, image_path) VALUES (?,?,?,?,?,?,?)',
                sample_products
            )
        db.commit()


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid username or password. Please try again.'
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    db = get_db()
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    query = 'SELECT * FROM products WHERE 1=1'
    params = []
    if search:
        query += ' AND (title LIKE ? OR description LIKE ?)'
        params += [f'%{search}%', f'%{search}%']
    if category:
        query += ' AND category = ?'
        params.append(category)
    query += ' ORDER BY created_at DESC'
    products = db.execute(query, params).fetchall()
    categories = [r['category'] for r in db.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    ).fetchall()]
    total = db.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    return render_template('dashboard.html', products=products, categories=categories,
                           total=total, search=search, selected_category=category)


@app.route('/products/add', methods=['GET', 'POST'])
@login_required
def add_product():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', '0')
        original_price = request.form.get('original_price', '')
        category = request.form.get('category', '').strip()
        badge = request.form.get('badge', '').strip()
        image_path = None

        if not title or not price:
            flash('Title and Price are required.', 'danger')
            return render_template('add_product.html')

        file = request.files.get('image')
        if file and file.filename and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename

        try:
            price = float(price)
            original_price = float(original_price) if original_price else None
        except ValueError:
            flash('Price must be a valid number.', 'danger')
            return render_template('add_product.html')

        db = get_db()
        db.execute(
            'INSERT INTO products (title, description, price, original_price, category, badge, image_path) VALUES (?,?,?,?,?,?,?)',
            (title, description, price, original_price, category or None, badge or None, image_path)
        )
        db.commit()
        flash(f'Product "{title}" added successfully!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('add_product.html')


@app.route('/products/edit/<int:product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if not product:
        flash('Product not found.', 'danger')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', '0')
        original_price = request.form.get('original_price', '')
        category = request.form.get('category', '').strip()
        badge = request.form.get('badge', '').strip()
        image_path = product['image_path']

        if not title or not price:
            flash('Title and Price are required.', 'danger')
            return render_template('edit_product.html', product=product)

        file = request.files.get('image')
        if file and file.filename and allowed_file(file.filename):
            if image_path:
                old_path = os.path.join(app.config['UPLOAD_FOLDER'], image_path)
                if os.path.exists(old_path):
                    os.remove(old_path)
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename

        try:
            price = float(price)
            original_price = float(original_price) if original_price else None
        except ValueError:
            flash('Price must be a valid number.', 'danger')
            return render_template('edit_product.html', product=product)

        db.execute(
            'UPDATE products SET title=?, description=?, price=?, original_price=?, category=?, badge=?, image_path=? WHERE id=?',
            (title, description, price, original_price, category or None, badge or None, image_path, product_id)
        )
        db.commit()
        flash(f'Product "{title}" updated successfully!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('edit_product.html', product=product)


@app.route('/products/delete/<int:product_id>', methods=['POST'])
@login_required
def delete_product(product_id):
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if not product:
        flash('Product not found.', 'danger')
        return redirect(url_for('dashboard'))
    if product['image_path']:
        old_path = os.path.join(app.config['UPLOAD_FOLDER'], product['image_path'])
        if os.path.exists(old_path):
            os.remove(old_path)
    db.execute('DELETE FROM products WHERE id = ?', (product_id,))
    db.commit()
    flash(f'Product "{product["title"]}" deleted.', 'warning')
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
