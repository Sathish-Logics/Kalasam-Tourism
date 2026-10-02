import { ServicePage, serviceMetadata } from "@/components/service-page";

export const generateMetadata = () => serviceMetadata("b2b-partners");
export default function PartnersPage() { return <ServicePage slug="b2b-partners" />; }
