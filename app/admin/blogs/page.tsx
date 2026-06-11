"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  User,
  Image as ImageIcon,
  Search,
  Calendar,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  author: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Toggle publish status directly
  const handleTogglePublish = async (blog: Blog) => {
    try {
      const nextStatus = blog.status === "published" ? "draft" : "published";
      const res = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blog.id, status: nextStatus }),
      });
      if (res.ok) {
        await fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${blogToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
        await fetchBlogs();
      } else {
        alert("Failed to delete blog post.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header Panel */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Blogs & News
          </h1>
          <p className="mt-1 text-sm text-dark-6">
            Write, edit, and publish news articles and blog updates for Miss Somali.
          </p>
        </div>
        <div>
          <Button onClick={() => router.push("/admin/blogs/new")} className="flex items-center gap-2 bg-primary hover:bg-opacity-90 font-bold">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-dark-6">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            placeholder="Search articles by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 bg-white dark:bg-dark-2 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-stroke bg-white px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white font-medium cursor-pointer min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Table List Card */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-[#081325] border border-stroke dark:border-dark-3 overflow-hidden">
        {filteredBlogs.length === 0 ? (
          <div className="py-20 text-center text-dark-6">
            <p className="font-medium text-sm">No blog articles match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2/40">
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px] w-28">Thumbnail</th>
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px]">Title</th>
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px]">Author</th>
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px]">Published Date</th>
                  <th className="px-6 py-4.5 text-left font-semibold text-dark-6 uppercase tracking-wider text-[10px]">Last Updated</th>
                  <th className="px-6 py-4.5 text-right font-semibold text-dark-6 uppercase tracking-wider text-[10px] w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-stroke last:border-0 hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="relative h-10 w-16 rounded-lg overflow-hidden border border-stroke dark:border-dark-3 bg-gray-100 flex items-center justify-center text-dark-6">
                        {blog.coverImage ? (
                          <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-dark dark:text-white">
                      <div>
                        <p className="line-clamp-2 max-w-[280px]">{blog.title}</p>
                        <p className="text-[10px] text-dark-6 font-mono mt-0.5 flex items-center gap-1 font-normal">
                          <LinkIcon className="h-3 w-3" />
                          /{blog.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(blog)}
                        className="cursor-pointer transition-opacity hover:opacity-85"
                        title="Click to toggle status"
                      >
                        {blog.status === "published" ? (
                          <Badge variant="default" className="bg-emerald-600 text-white border-none text-[10px] px-2 py-0.5 font-bold uppercase">
                            <CheckCircle className="mr-1 h-3 w-3" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="border-none text-[10px] px-2 py-0.5 font-bold uppercase bg-gray-2 text-dark-5 dark:bg-dark-3 dark:text-dark-6">
                            <XCircle className="mr-1 h-3 w-3 opacity-60" /> Draft
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-dark-5 dark:text-dark-6 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 opacity-60" />
                        {blog.author}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-6">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 opacity-50" />
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-6">
                      <span className="flex items-center gap-1.5 text-xs">
                        <RefreshCw className="h-3.5 w-3.5 opacity-50" />
                        {new Date(blog.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                          title="Edit article"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setBlogToDelete(blog);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the blog post <strong>{blogToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBlog} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
