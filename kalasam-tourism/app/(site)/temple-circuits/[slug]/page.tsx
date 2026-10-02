import { ContentDetail, detailMetadata, resolveDetail } from "@/components/content-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return detailMetadata("circuit", (await params).slug);
}

export default async function CircuitPage({ params }: Props) {
  return <ContentDetail entry={await resolveDetail("circuit", (await params).slug)} kind="circuit" />;
}
