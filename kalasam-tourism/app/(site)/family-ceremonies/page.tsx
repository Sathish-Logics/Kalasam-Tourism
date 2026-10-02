import { ServicePage, serviceMetadata } from "@/components/service-page";

export async function generateMetadata() { return serviceMetadata("family-ceremonies"); }

export default function FamilyCeremoniesPage() { return <ServicePage slug="family-ceremonies" />; }
