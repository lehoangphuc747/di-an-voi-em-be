import { useParams } from "react-router-dom";

const DetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">Chi tiết món ăn</h1>
      <p>ID Món ăn: {id}</p>
      <p>Chi tiết sẽ được xây dựng ở bước tiếp theo.</p>
    </div>
  );
};

export default DetailPage;