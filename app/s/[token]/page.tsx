import type { Metadata } from "next";
import { getSharedContext } from "@/lib/services/share-service";
import { SharedEditorWrapper } from "@/components/pages/share/SharedEditorWrapper";
import { ExpiredLinkView } from "@/components/pages/share/ExpiredLinkView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const context = await getSharedContext(token);

  if (!context) {
    return {
      title: "Shared Link Expired | Markdown Studio",
      description: "This shared markdown context link has expired or is no longer available.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${context.title} | Shared on Markdown Studio`;
  const description = `Live interactive markdown document containing ${context.metadata.wordCount} words and ${context.metadata.lineCount} lines. View and fork directly in Markdown Studio.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function SharedContextPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await getSharedContext(token);

  if (!context) {
    return <ExpiredLinkView />;
  }

  return <SharedEditorWrapper contextData={context} />;
}
