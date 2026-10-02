import { ServicePage, serviceMetadata } from "@/components/service-page";

export async function generateMetadata() { return serviceMetadata("senior-assistance"); }

export default function SeniorAssistancePage() { return <ServicePage slug="senior-assistance" />; }
