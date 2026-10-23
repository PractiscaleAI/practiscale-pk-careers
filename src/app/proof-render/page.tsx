import type { Metadata } from "next";
import ProofRender from "@/components/proof-render";
export const metadata: Metadata = {
  title: "Proof animation review",
  robots: { index: false, follow: false },
};
export default function ProofRenderPage() {
  return <ProofRender />;
}
