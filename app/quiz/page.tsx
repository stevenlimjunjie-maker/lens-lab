import type { Metadata } from "next";
import { Masthead } from "@/components/ui/Masthead";
import { Quiz } from "@/components/modules/Quiz";
import { NextModule } from "@/components/modules/NextModule";

export const metadata: Metadata = {
  title: "Fix the photo quiz",
  description: "Spot what went wrong in a photo (blur, noise, blown highlights, colour casts) and pick the setting that fixes it.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <>
      <Masthead
        label="Module 05 · Quiz"
        title="Fix the photo"
        dek="Each photo below has one problem. Look closely, then pick the setting that fixes it. You get instant feedback and a score at the end."
      />
      <Quiz />
      <NextModule current="/quiz" />
    </>
  );
}
