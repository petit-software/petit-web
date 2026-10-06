"use client";

import { Fragment, useEffect, useState, type CSSProperties } from "react";
import CmraPhone from "@/components/CmraPhone/CmraPhone";
import styles from "./CmraHero.module.css";
import { Button } from "@/components/ui/button";

const quoteWords = "The best camera is the one you have with you.".split(" ");
const title = "A Minimalistic Camera for Real Photos";
const titleWords = title.split(" ");
const wordStyle = (index: number) => ({ "--word-index": index }) as CSSProperties;

export default function CmraHero() {
  const [stage, setStage] = useState<"intro" | "title" | "button" | "phone">("intro");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [buttonVisible, setButtonVisible] = useState(false);

  return (
    <section
      className={`${styles.hero} mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-8 px-6 py-6 md:grid-cols-2 md:gap-12`}
      data-stage={stage}
      data-mounted={mounted}
    >
      {stage === "intro" && (
        <div
          className={styles.intro}
          aria-hidden="true"
        >
          <p className={`${styles.quote} max-w-3xl px-6 text-center text-5xl font-medium tracking-tight sm:text-6xl`}>
            {quoteWords.map((word, index) => (
              <Fragment key={index}>
                {index > 0 && " "}
                <span
                  className={styles.quoteWord}
                  style={wordStyle(index)}
                  onAnimationEnd={(event) => {
                    if (event.target === event.currentTarget && index === quoteWords.length - 1) {
                      setStage("title");
                    }
                  }}
                >
                  <span className={styles.quoteWordIn}>{word}</span>
                </span>
              </Fragment>
            ))}
          </p>
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-8 pb-8 text-center md:pb-0">
        <h1
          className={`${styles.title} text-5xl font-medium tracking-tight sm:text-6xl`}
          aria-label={title}
        >
          {titleWords.map((word, index) => (
            <Fragment key={index}>
              {index > 0 && " "}
              <span
                aria-hidden="true"
                className={styles.titleWord}
                style={wordStyle(index)}
                onAnimationEnd={() => {
                  if (index === titleWords.length - 1) setStage("button");
                }}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
        <div
          className={styles.button}
          inert={!buttonVisible}
          aria-hidden={!buttonVisible}
          onAnimationStart={() => setButtonVisible(true)}
          onAnimationEnd={() => setStage("phone")}
        >
          <Button asChild>
            <a href="https://apps.apple.com/us/app/cmra-a-camera-kept-simple/id6814959734">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="relative -top-0.5 size-5"
                data-icon="inline-start"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M17.05 12.536c.031 3.324 2.916 4.43 2.948 4.444-.024.078-.461 1.577-1.52 3.126-.916 1.339-1.867 2.673-3.364 2.701-1.47.027-1.943-.873-3.624-.873-1.68 0-2.205.845-3.597.9-1.445.055-2.546-1.448-3.469-2.782-1.885-2.728-3.326-7.709-1.392-11.071.961-1.67 2.678-2.728 4.542-2.755 1.419-.027 2.759.955 3.627.955.868 0 2.496-1.181 4.212-1.008.719.03 2.737.29 4.033 2.188-.104.064-2.408 1.402-2.383 4.175ZM14.286 4.368c.767-.928 1.283-2.221 1.142-3.507-1.105.044-2.441.736-3.234 1.664-.711.822-1.334 2.137-1.166 3.397 1.232.095 2.49-.626 3.258-1.554Z" />
              </svg>
              Download on AppStore
            </a>
          </Button>
        </div>
      </div>
      <div className="flex min-h-[420px] md:min-h-[520px]">
        <CmraPhone revealed={stage === "phone"} />
      </div>
    </section>
  );
}
