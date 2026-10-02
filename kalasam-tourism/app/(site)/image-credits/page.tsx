import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/public-ui";

export const metadata = pageMetadata("Image credits", "Photographer and license credits for destination images used in the local preview.", "/image-credits", undefined, true);

export default function ImageCreditsPage() {
  return <><PageHero eyebrow="Photo acknowledgments" title="Image credits" description="Openly licensed photographs used in the local preview. Replace these with client-approved, licensed images before launch." />
    <section className="section container"><div className="prose">
      <h2>Brihadeeswarar Temple at sunset</h2><p>Photo by Madhuranthakan Jagadeesan. <Link href="https://commons.wikimedia.org/wiki/File:N-TN-C192_Brihadeeswarar_Temple_at_Sunset.jpg">Source on Wikimedia Commons</Link>. Licensed under <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Link>. No modifications made.</p>
      <h2>Kerala backwaters and houseboat</h2><p>Photo by Vyacheslav Argenberg. <Link href="https://commons.wikimedia.org/wiki/File:Kerala_backwaters,_Houseboat,_India.jpg">Source on Wikimedia Commons</Link>. Licensed under <Link href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</Link>. No modifications made.</p>
      <h2>Virupaksha Temple, Hampi</h2><p>Photo by Rohit14400. <Link href="https://commons.wikimedia.org/wiki/File:Virupaksha_Temple_(Gopuram_from_Hemakutta_Hill_mantapa),_Hampi_01.jpg">Source on Wikimedia Commons</Link>. Licensed under <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Link>. No modifications made.</p>
    </div></section></>;
}
