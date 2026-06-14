"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, BookOpen } from "lucide-react";

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogsSection() {
  const [blogs, setBlogs] = useState<BlogData[]>([]);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (data && data.length > 0) {
          setBlogs(data);
        }
      })
      .catch((err) => console.error("Error fetching blogs:", err));
  }, []);

  // Calculate dynamic reading time based on content length
  const calculateReadingTime = (content: string): number => {
    if (!content) return 3;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200)); // ~200 WPM
  };

  // Fallback blogs if database is empty
  const fallbackBlogs: BlogData[] = [
    {
      id: "fallback-1",
      title: "How Miss Somali celebrates and empowers Somali cultural heritage",
      slug: "celebrating-somali-heritage",
      excerpt: "Celebrating traditional arts, values, and leadership paths across the global diaspora.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about1.webp",
      author: "Organization",
      publishedAt: "2026-06-12T10:00:00.000Z",
      createdAt: "2026-06-12T10:00:00.000Z"
    },
    {
      id: "fallback-2",
      title: "Behind the scenes of the leadership and public speaking bootcamp",
      slug: "leadership-bootcamp-behind-scenes",
      excerpt: "A deep dive into the intensive training workshops preparing delegates for the global stage.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about2.webp",
      author: "Bootcamp Team",
      publishedAt: "2026-05-28T09:00:00.000Z",
      createdAt: "2026-05-28T09:00:00.000Z"
    },
    {
      id: "fallback-3",
      title: "What your journey looks like: preparing to represent your community",
      slug: "preparing-to-represent-community",
      excerpt: "Contestants share their motivation, personal growth, and goals for Miss Somali 2026.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about3.webp",
      author: "Media Press",
      publishedAt: "2026-05-15T08:00:00.000Z",
      createdAt: "2026-05-15T08:00:00.000Z"
    }
  ];

  const displayedBlogs = (blogs.length > 0 ? blogs : fallbackBlogs).slice(0, 3);

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  } as const;

  return (
    <section id="blogs" className="bg-[#FFFFFF] py-20 md:py-28 border-t border-[#E8E8E8]">
      <div className="grid-container relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-[12px] font-medium uppercase tracking-wider mb-6">
            STORIES & INSIGHTS
          </div>
          
          <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold text-[#071E4A] tracking-tight leading-[1.15] max-w-4xl mb-4">
            Latest from our Blog
          </h2>
          
          <div className="w-12 h-[2px] bg-[#0B2D6B] mb-6 rounded-full" />
          
          <p className="text-slate-500 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
            Follow the inspiring journeys of our contestants, explore cultural narratives, and stay updated on event timelines and details.
          </p>
        </div>

        {/* Blog Post Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayedBlogs.map((blog) => {
            const displayDate = blog.publishedAt 
              ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              : new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

            const readingTime = calculateReadingTime(blog.content);

            return (
              <motion.div
                key={blog.id}
                className="group flex flex-col h-full cursor-pointer"
                variants={cardVariants}
              >
                {/* 1. Large Rounded Image Card */}
                <div className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-slate-100 mb-6 shadow-sm border border-slate-100">
                  <Image
                    src={blog.coverImage || "/images/about1.webp"}
                    alt={blog.title}
                    fill
                    sizes="(max-w-768px) 100vw, 30vw"
                    className="object-cover object-center transition-transform duration-750 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                {/* 2. Bold Headline/Title */}
                <h3 className="text-[#071E4A] font-semibold text-xl md:text-[22px] leading-snug tracking-tight mb-4 group-hover:text-[#0B2D6B] transition-colors duration-250">
                  <Link href={`/blogs/${blog.slug}`} className="hover:underline line-clamp-2">
                    {blog.title}
                  </Link>
                </h3>

                {/* 3. Meta Data details row */}
                <div className="flex items-center gap-6 mt-auto text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{displayDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
