import { ContentDetail, detailMetadata, resolveDetail } from "@/components/content-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return detailMetadata("journey", (await params).slug);
}

export default async function JourneyPage({ params }: Props) {
  return <ContentDetail entry={await resolveDetail("journey", (await params).slug)} kind="journey" />;
}
