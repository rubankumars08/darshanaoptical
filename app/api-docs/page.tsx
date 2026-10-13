export default function ApiDocsPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fafafa]">
      <iframe
        src="/swagger.html"
        title="Darshana Optical - Swagger UI Documentation"
        className="h-full w-full border-0"
      />
    </div>
  );
}
