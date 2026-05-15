import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "@/pages/Home";
import ProductPage from "@/pages/Product";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6 text-center">
      <h1 className="font-display text-7xl font-black">404</h1>
      <h2 className="text-xl font-semibold">Page not found</h2>
      <a href="/" className="bg-foreground text-background px-6 py-3 rounded-full font-bold hover:opacity-80 transition-opacity">
        Go home
      </a>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/product/:slug" component={ProductPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppRouter />
    </WouterRouter>
  );
}
