import { ContentDetail, detailMetadata, resolveDetail } from "@/components/content-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return detailMetadata("destination", (await params).slug);
}

export default async function DestinationPage({ params }: Props) {
  return <ContentDetail entry={await resolveDetail("destination", (await params).slug)} kind="destination" />;
}
