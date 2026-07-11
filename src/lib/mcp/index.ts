import { defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import verifyCertificate from "./tools/verify-certificate";
import submitInternshipApplication from "./tools/submit-internship-application";

export default defineMcp({
  name: "dten-mcp",
  title: "Daryl Tech Educational Network",
  version: "0.1.0",
  instructions:
    "Tools for Daryl Tech Educational Network (DTEN): browse published blog posts, verify student certificates by enrollment ID (DTEN-...), and submit internship applications.",
  tools: [listBlogPosts, getBlogPost, verifyCertificate, submitInternshipApplication],
});
