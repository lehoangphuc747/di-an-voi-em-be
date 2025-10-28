import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background text-center px-4">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-3xl font-semibold mt-4">Oops! Không tìm thấy trang</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không có sẵn.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  );
};

export default NotFound;