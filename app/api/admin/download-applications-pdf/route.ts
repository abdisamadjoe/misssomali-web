import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { Prisma, Status } from "@prisma/client";
import puppeteer from "puppeteer";

function calculateAge(dateOfBirth: Date | string | null): string {
  if (!dateOfBirth) return "—";
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age.toString();
}

function getOptimizedImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/image/upload/", "/image/upload/c_fill,w_300,h_400,q_75/");
}

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const country = searchParams.get("country");
    const search = searchParams.get("search");

    const where: Prisma.ContestantApplicationWhereInput = {};

    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter as Status;
    } else {
      where.status = { not: "draft" };
    }

    if (country && country !== "all") {
      where.country = country;
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const applications = await prisma.contestantApplication.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        user: {
          include: {
            photos: true,
          },
        },
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: "No applications found to generate PDF." }, { status: 404 });
    }

    // Generate HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Miss Somali Applications Report</title>
  <style>
    @media print {
      .page-break { page-break-after: always; }
      .page-break:last-child { page-break-after: avoid; }
    }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #111;
      font-size: 11px;
      line-height: 1.4;
      background-color: #ffffff;
    }
    .container {
      padding: 20px;
    }
    .report-header {
      border-bottom: 2px solid #111;
      padding-bottom: 10px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .report-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-meta {
      font-size: 9px;
      color: #555;
      text-align: right;
    }
    .app-card {
      margin-bottom: 20px;
    }
    .app-title-bar {
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 8px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
      letter-spacing: 0.3px;
    }
    .value {
      font-size: 11px;
      font-weight: 500;
      color: #111;
    }
    .full-width {
      grid-column: span 2;
    }
    .section-title {
      font-size: 10px;
      font-weight: bold;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin: 15px 0 8px 0;
      text-transform: uppercase;
      color: #333;
      letter-spacing: 0.3px;
    }
    .long-text {
      font-size: 10px;
      color: #222;
      white-space: pre-wrap;
      text-align: justify;
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 4px;
      padding: 8px;
      margin-top: 3px;
    }
    .photos-container {
      margin-top: 10px;
    }
    .photos-grid {
      display: flex;
      gap: 15px;
    }
    .photo-box {
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 4px;
      background: #f9fafb;
      text-align: center;
    }
    .photo-img {
      width: 130px;
      height: 170px;
      object-fit: cover;
      display: block;
      border-radius: 2px;
    }
    .photo-label {
      font-size: 8px;
      font-weight: bold;
      margin-top: 4px;
      color: #555;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="report-header">
      <div>
        <h1 class="report-title">Miss Somali Applications Report</h1>
        <p style="margin: 4px 0 0 0; font-size: 10px; color: #555;">Official Committee Review Document</p>
      </div>
      <div class="report-meta">
        <div>Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
        <div>Total Applications: ${applications.length}</div>
      </div>
    </div>

    ${applications.map((app, index) => {
      const portraitPhoto = app.user?.photos?.find(p => p.type === 'profile');
      const fullBodyPhoto = app.user?.photos?.find(p => p.type === 'full_body');
      
      const dobStr = app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
      const appliedStr = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
      
      return `
      <div class="app-card ${index < applications.length - 1 ? 'page-break' : ''}">
        <div class="app-title-bar">
          <span>Application #${app.applicationNumber || '—'}</span>
          <span>Status: ${app.status.toUpperCase()}</span>
        </div>

        <div class="section-title">Personal Information</div>
        <div class="grid">
          <div class="field">
            <span class="label">Full Name</span>
            <span class="value">${app.user?.fullName || app.fullName || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Phone Number</span>
            <span class="value">${app.phone || app.user?.phone || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Location</span>
            <span class="value">${app.city || '—'}, ${app.country || app.user?.country || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Date of Birth (Age)</span>
            <span class="value">${dobStr} (Age: ${calculateAge(app.dateOfBirth)})</span>
          </div>
        </div>

        <div class="section-title">Professional & Background Details</div>
        <div class="grid">
          <div class="field">
            <span class="label">Education Level</span>
            <span class="value">${app.educationLevel || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Occupation</span>
            <span class="value">${app.occupation || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Height</span>
            <span class="value">${app.height ? `${app.height} cm` : '—'}</span>
          </div>
          <div class="field">
            <span class="label">Submission Date</span>
            <span class="value">${appliedStr}</span>
          </div>
          <div class="field">
            <span class="label">Languages Spoken</span>
            <span class="value">${app.languages || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Special Skills / Talent</span>
            <span class="value">${app.skills || '—'}</span>
          </div>
          <div class="field">
            <span class="label">Instagram</span>
            <span class="value">${app.instagram ? `@${app.instagram.replace(/^@/, '')}` : '—'}</span>
          </div>
          <div class="field">
            <span class="label">TikTok</span>
            <span class="value">${app.tiktok ? `@${app.tiktok.replace(/^@/, '')}` : '—'}</span>
          </div>
        </div>

        <div class="section-title">Motivation & Essay Responses</div>
        <div class="grid">
          <div class="field full-width">
            <span class="label">Why do you want to participate in Miss Somali?</span>
            <div class="long-text">${app.motivationWhy || '—'}</div>
          </div>
          ${app.personalStory ? `
          <div class="field full-width">
            <span class="label">Personal Story / Background</span>
            <div class="long-text">${app.personalStory}</div>
          </div>
          ` : ''}
          ${app.goals ? `
          <div class="field full-width">
            <span class="label">Goals & Aspirations</span>
            <div class="long-text">${app.goals}</div>
          </div>
          ` : ''}
        </div>

        <div class="section-title">Uploaded Media</div>
        <div class="photos-container">
          <div class="photos-grid">
            ${portraitPhoto ? `
            <div class="photo-box">
              <img class="photo-img" src="${getOptimizedImageUrl(portraitPhoto.url)}" />
              <div class="photo-label">Portrait Photo</div>
            </div>
            ` : ''}
            ${fullBodyPhoto ? `
            <div class="photo-box">
              <img class="photo-img" src="${getOptimizedImageUrl(fullBodyPhoto.url)}" />
              <div class="photo-label">Full Body Photo</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      `;
    }).join('')}
  </div>
</body>
</html>
`;

    // Launch puppeteer
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        bottom: "15mm",
        left: "15mm",
        right: "15mm",
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="applications-report-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF document." }, { status: 500 });
  }
}
