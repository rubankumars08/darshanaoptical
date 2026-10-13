import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Darshana Optical",
  description: "REST API documentation and database endpoints for Darshana Optical.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
