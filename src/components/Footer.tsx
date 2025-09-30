export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Ăn Gì Đây?. All rights reserved.</p>
      </div>
    </footer>
  );
};