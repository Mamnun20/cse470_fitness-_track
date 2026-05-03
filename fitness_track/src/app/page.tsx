"use client"
import Image from "next/image"
import styles from "./page.module.css"
import HomeBanner1 from "@/components/homebanner1/homebanner1"
import HomeBanner2 from "@/components/homebanner2/homebanner2"

export default function Home() {
  return (
      <main className={styles.main}>
        <HomeBanner1 />
        <HomeBanner2 />
      </main>
  )
}
