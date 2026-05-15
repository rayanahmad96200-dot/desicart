import os
import uuid
import sqlite3
import json
from functools import wraps
from flask import (
    Flask, Blueprint, render_template, request, redirect,
    url_for, session, flash, g, jsonify, send_from_directory
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

BASE = '/admin-panel'


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
                slug TEXT UNIQUE,
                title TEXT NOT NULL,
                tagline TEXT,
                description TEXT,
                features TEXT,
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
            seed = [
                ('ultra-3-smartwatch', 'Ultra 3 Smartwatch', "Pakistan's Most Versatile 7-Strap Luxury Watch",
                 'The ultimate smartwatch package. Featuring a stunning Super AMOLED display and 7 different interchangeable straps to match every outfit.',
                 json.dumps(['Big Full HD Infinite Display', '7 Premium Straps Included in Box', 'Wireless Fast Charging', 'Bluetooth Calling & Heart Rate Monitoring', 'Sports Mode & Calculator Built-in']),
                 4500, 12000, 'Smart Watches', 'Best Seller', 'ultra3-watch.png'),
                ('airpods-pro-2-black', 'Airpods Pro 2 Black', 'Master Copy | ANC & Deep Bass',
                 'Experience premium sound with the sleek Airpods Pro 2 in a stunning matte black finish.',
                 json.dumps(['Active Noise Cancellation (ANC) support', 'Superior Bass & Crisp Treble', '3-4 Hours Playback Time', 'Touch Controls for Music & Calls', 'Wireless Charging Case']),
                 1500, 3500, 'Earbuds', 'Best Seller', 'airpods-pro-2.png'),
                ('portable-ac-cooling-fan', 'Portable AC Cooling Fan', '3-in-1 Cooler, Humidifier & Air Purifier',
                 'Beat the heat with this ultra-portable personal air cooler. Features whisper-quiet operation and built-in water tank.',
                 json.dumps(['3-in-1: Cooling Fan + Humidifier + Air Purifier', 'Built-in Water Tank (up to 8 hours cooling)', '3 Fan Speed Settings', 'Ultra-Quiet Night Mode', 'USB Powered — No Electricity Required']),
                 1999, 4500, 'Accessories', 'Summer Deal', 'portable-ac-fan.png'),
                ('powerbank-10000mah-slim', '10000mAh Slim Power Bank', 'PD 22.5W Fast Charging | Ultra Slim Design',
                 'Never run out of battery with this sleek, pocket-sized 10000mAh power bank with crystal-clear LED digital display.',
                 json.dumps(['22.5W PD Fast Charging', 'LED Digital Battery Percentage Display', 'Ultra-Slim Pocket-Friendly Design', 'Charges 2 Devices Simultaneously', 'Aviation-Grade Battery Cell Protection']),
                 1999, 4000, 'Power Banks', 'New', 'powerbank-10k-slim.png'),
                ('powerbank-20000mah-transparent', '20000mAh Transparent Power Bank', '66W Super Fast Charging | See-Through Tech',
                 'The most powerful power bank with a stunning transparent body that shows off the internal circuit board.',
                 json.dumps(['66W Blazing Fast PD Charging', 'Transparent Body — Show Off Your Tech', 'Digital Display: Battery % + Output Current/Voltage', '20000mAh Capacity — Charges Phone 5-6 Times', 'Multi-device Support: Type-C + USB-A Ports']),
                 3499, 7000, 'Power Banks', 'Trending', 'powerbank-20k-transparent.png'),
                ('kts-1185-speaker', 'KTS-1185 Wireless Speaker', '3-Inch Drive | Built-in Emergency Torch',
                 'A portable powerhouse for music lovers with a 3-inch high-bass driver and built-in emergency light.',
                 json.dumps(['3\" Powerful Audio Drive', 'Built-in High-Power Emergency Light', 'FM Radio & USB/TF Card Support', 'Wireless Bluetooth Connectivity', 'Rugged, Portable Design with Handle']),
                 1800, 3500, 'Speakers', 'New', 'kts-1185-speaker.png'),
                ('p9-wireless-headphones', 'P9 Wireless Headphones', 'Deep Bass | 20H Playtime | Foldable Design',
                 'The P9 over-ear wireless headphones deliver studio-quality sound in a sleek, foldable design.',
                 json.dumps(['Powerful Deep Bass Sound', '20-Hour Battery Life', 'Foldable & Lightweight — Travel-Ready', 'Built-in Mic for Hands-Free Calls', 'Bluetooth 5.0 + 3.5mm Wired Mode']),
                 1499, 3500, 'Headphones', 'Hot Pick', 'p9-headphones.png'),
                ('super-charger-powerbank', 'Super Charger Power Bank', 'LED Digital Display | PD Fast Charging',
                 'Never run out of juice again with this intelligent super-fast charging power bank.',
                 json.dumps(['Intelligent Super Fast Charging', 'LED Digital Battery Percentage Display', 'Type-C PD 20W Output', 'Travel-Friendly Design (Check-in OK)', 'Multiple Device Protection Circuit']),
                 2999, 6000, 'Power Banks', 'Limited', 'powerbank.png'),
                ('akg-handsfree', 'AKG Type-C Handsfree', 'Best Sound and Bass | Samsung Optimized',
                 'Original-quality AKG tuned earphones featuring deep bass and crystal clear audio.',
                 json.dumps(['Tuned by AKG for Studio Quality Sound', 'Tangle-free Fabric Cable', 'In-line Mic with Volume Control', 'Extra Bass Boost Technology', 'Ergonomic In-ear Design']),
                 600, 1200, 'Headphones', None, 'akg-handsfree.png'),
                ('kts-1706-solar-speaker', 'KTS-1706 Solar Speaker', '4-Inch Drive | Solar Powered Music',
                 'A rugged outdoor speaker with a built-in solar panel and massive 4-inch driver.',
                 json.dumps(['Built-in Solar Charging Panel', 'Large 4\" High-Output Driver', 'High-Power LED Flashlight', 'Bluetooth, USB, and SD Card Support', 'Long-lasting Rechargeable Battery']),
                 2500, 4500, 'Speakers', 'Outdoor', 'solar-speaker.png'),
            ]
            db.executemany(
                'INSERT INTO products (slug,title,tagline,description,features,price,original_price,category,badge,image_path) VALUES (?,?,?,?,?,?,?,?,?,?)',
                seed
            )
        db.commit()


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('index') + 'login')
        return f(*args, **kwargs)
    return decorated


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file):
    if file and file.filename and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return filename
    return None


def make_slug(title):
    import re
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')


# ── Static files under /admin-panel/static/ ──────────────────────────────────

@app.route('/admin-panel/static/<path:filename>')
def admin_static(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)


# ── API ──────────────────────────────────────────────────────────────────────

@app.route('/admin-panel/api/products')
def api_products():
    db = get_db()
    rows = db.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
    result = []
    for p in rows:
        features = []
        try:
            features = json.loads(p['features']) if p['features'] else []
        except Exception:
            pass
        image_url = None
        if p['image_path']:
            image_url = f"{BASE}/static/uploads/{p['image_path']}"
        result.append({
            'id': p['id'],
            'slug': p['slug'],
            'title': p['title'],
            'tagline': p['tagline'] or '',
            'description': p['description'] or '',
            'features': features,
            'price': p['price'],
            'original_price': p['original_price'],
            'category': p['category'] or '',
            'badge': p['badge'] or '',
            'image_url': image_url,
        })
    resp = jsonify(result)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


# ── Admin pages ───────────────────────────────────────────────────────────────

@app.route('/admin-panel/')
@app.route('/admin-panel')
def index():
    if session.get('logged_in'):
        return redirect('/admin-panel/dashboard')
    return redirect('/admin-panel/login')


@app.route('/admin-panel/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect('/admin-panel/dashboard')
    error = None
    if request.method == 'POST':
        if request.form.get('username', '').strip() == ADMIN_USERNAME and \
                request.form.get('password', '').strip() == ADMIN_PASSWORD:
            session['logged_in'] = True
            session['username'] = request.form['username']
            return redirect('/admin-panel/dashboard')
        error = 'Invalid username or password. Please try again.'
    return render_template('login.html', error=error, base=BASE)


@app.route('/admin-panel/logout')
def logout():
    session.clear()
    return redirect('/admin-panel/login')


@app.route('/admin-panel/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect('/admin-panel/login')
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
                           total=total, search=search, selected_category=category, base=BASE)


@app.route('/admin-panel/products/add', methods=['GET', 'POST'])
def add_product():
    if not session.get('logged_in'):
        return redirect('/admin-panel/login')
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        if not title:
            flash('Title is required.', 'danger')
            return render_template('add_product.html', base=BASE)
        tagline = request.form.get('tagline', '').strip()
        description = request.form.get('description', '').strip()
        price_str = request.form.get('price', '0')
        original_price_str = request.form.get('original_price', '')
        category = request.form.get('category', '').strip()
        badge = request.form.get('badge', '').strip()
        features_raw = request.form.get('features', '').strip()
        features = json.dumps([f.strip() for f in features_raw.split('\n') if f.strip()])
        try:
            price = float(price_str)
            original_price = float(original_price_str) if original_price_str else None
        except ValueError:
            flash('Price must be a valid number.', 'danger')
            return render_template('add_product.html', base=BASE)
        image_path = save_image(request.files.get('image'))
        slug = make_slug(title)
        db = get_db()
        existing = db.execute('SELECT id FROM products WHERE slug = ?', (slug,)).fetchone()
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:4]}"
        db.execute(
            'INSERT INTO products (slug,title,tagline,description,features,price,original_price,category,badge,image_path) VALUES (?,?,?,?,?,?,?,?,?,?)',
            (slug, title, tagline, description, features, price, original_price, category or None, badge or None, image_path)
        )
        db.commit()
        flash(f'Product "{title}" added successfully!', 'success')
        return redirect('/admin-panel/dashboard')
    return render_template('add_product.html', base=BASE)


@app.route('/admin-panel/products/edit/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    if not session.get('logged_in'):
        return redirect('/admin-panel/login')
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if not product:
        flash('Product not found.', 'danger')
        return redirect('/admin-panel/dashboard')
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        if not title:
            flash('Title is required.', 'danger')
            return render_template('edit_product.html', product=product, base=BASE)
        tagline = request.form.get('tagline', '').strip()
        description = request.form.get('description', '').strip()
        price_str = request.form.get('price', '0')
        original_price_str = request.form.get('original_price', '')
        category = request.form.get('category', '').strip()
        badge = request.form.get('badge', '').strip()
        features_raw = request.form.get('features', '').strip()
        features = json.dumps([f.strip() for f in features_raw.split('\n') if f.strip()])
        try:
            price = float(price_str)
            original_price = float(original_price_str) if original_price_str else None
        except ValueError:
            flash('Price must be a valid number.', 'danger')
            return render_template('edit_product.html', product=product, base=BASE)
        image_path = product['image_path']
        new_file = save_image(request.files.get('image'))
        if new_file:
            if image_path:
                old = os.path.join(UPLOAD_FOLDER, image_path)
                if os.path.exists(old):
                    os.remove(old)
            image_path = new_file
        db.execute(
            'UPDATE products SET title=?,tagline=?,description=?,features=?,price=?,original_price=?,category=?,badge=?,image_path=? WHERE id=?',
            (title, tagline, description, features, price, original_price, category or None, badge or None, image_path, product_id)
        )
        db.commit()
        flash(f'Product "{title}" updated!', 'success')
        return redirect('/admin-panel/dashboard')
    features_text = ''
    try:
        features_text = '\n'.join(json.loads(product['features'])) if product['features'] else ''
    except Exception:
        pass
    return render_template('edit_product.html', product=product, features_text=features_text, base=BASE)


@app.route('/admin-panel/products/delete/<int:product_id>', methods=['POST'])
def delete_product(product_id):
    if not session.get('logged_in'):
        return redirect('/admin-panel/login')
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if product:
        if product['image_path']:
            old = os.path.join(UPLOAD_FOLDER, product['image_path'])
            if os.path.exists(old):
                os.remove(old)
        db.execute('DELETE FROM products WHERE id = ?', (product_id,))
        db.commit()
        flash(f'Product "{product["title"]}" deleted.', 'warning')
    return redirect('/admin-panel/dashboard')


if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
