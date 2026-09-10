import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Media & Asset Management", () => {
  test("media library: upload image, view, filter", async ({ page, request }) => {
    const email = `media-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Media Test" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Media Business ${Date.now()}` },
    });
    expect(bizRes.ok()).toBeTruthy();
    const business = (await bizRes.json()).data;

    // Create a test image file
    const imageBuffer = Buffer.from("fake-image-data-for-test");
    const uploadRes = await request.post(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
      multipart: {
        file: {
          name: "test-photo.jpg",
          mimeType: "image/jpeg",
          buffer: imageBuffer,
        },
      },
    });
    expect(uploadRes.ok()).toBeTruthy();
    const uploadedAsset = (await uploadRes.json()).data;
    expect(uploadedAsset.mediaType).toBe("IMAGE");
    expect(uploadedAsset.mimeType).toBe("image/jpeg");

    // Create a test video
    const videoBuffer = Buffer.from("fake-video-data-for-test");
    const uploadVideo = await request.post(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
      multipart: {
        file: {
          name: "hero-video.mp4",
          mimeType: "video/mp4",
          buffer: videoBuffer,
        },
      },
    });
    expect(uploadVideo.ok()).toBeTruthy();
    const uploadedVideo = (await uploadVideo.json()).data;
    expect(uploadedVideo.mediaType).toBe("VIDEO");

    // List all media
    const listRes = await request.get(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const assets = (await listRes.json()).data;
    expect(assets.length).toBeGreaterThanOrEqual(2);

    // Filter by VIDEO
    const filterRes = await request.get(`${API}/businesses/${business.id}/media?mediaType=VIDEO`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(filterRes.ok()).toBeTruthy();
    const videoAssets = (await filterRes.json()).data;
    expect(videoAssets.every((a: any) => a.mediaType === "VIDEO")).toBeTruthy();

    // Filter by IMAGE
    const filterImgRes = await request.get(`${API}/businesses/${business.id}/media?mediaType=IMAGE`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(filterImgRes.ok()).toBeTruthy();
    const imgAssets = (await filterImgRes.json()).data;
    expect(imgAssets.every((a: any) => a.mediaType === "IMAGE")).toBeTruthy();

    // Update metadata
    const patchRes = await request.patch(`${API}/businesses/${business.id}/media/${uploadedAsset.id}`, {
      headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
      data: { altText: "Restaurant photo", title: "Hero Image", width: 1920, height: 1080 },
    });
    expect(patchRes.ok()).toBeTruthy();
    const patched = (await patchRes.json()).data;
    expect(patched.altText).toBe("Restaurant photo");
    expect(patched.title).toBe("Hero Image");
    expect(patched.width).toBe(1920);

    // Stream file
    const fileRes = await request.get(`${API}/businesses/${business.id}/media/${uploadedAsset.id}/file`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(fileRes.ok()).toBeTruthy();

    // Delete
    const delRes = await request.delete(`${API}/businesses/${business.id}/media/${uploadedAsset.id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(delRes.ok()).toBeTruthy();
  });

  test("tenant isolation: business cannot access another business media", async ({ request }) => {
    const email1 = `tenant-a-${Date.now()}@test.com`;
    const signup1 = await request.post(`${API}/auth/signup`, {
      data: { email: email1, password: "password123", displayName: "Tenant A" },
    });
    const session1 = (await signup1.json()).data;
    const biz1Res = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session1.token}` },
      data: { name: "Business A" },
    });
    const biz1 = (await biz1Res.json()).data;

    const email2 = `tenant-b-${Date.now()}@test.com`;
    const signup2 = await request.post(`${API}/auth/signup`, {
      data: { email: email2, password: "password123", displayName: "Tenant B" },
    });
    const session2 = (await signup2.json()).data;
    const biz2Res = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session2.token}` },
      data: { name: "Business B" },
    });
    const biz2 = (await biz2Res.json()).data;

    // Business A uploads
    const uploadA = await request.post(`${API}/businesses/${biz1.id}/media`, {
      headers: { Authorization: `Bearer ${session1.token}` },
      multipart: {
        file: { name: "secret.jpg", mimeType: "image/jpeg", buffer: Buffer.from("secret-a") },
      },
    });
    expect(uploadA.ok()).toBeTruthy();
    const assetA = (await uploadA.json()).data;

    // Business B cannot access Business A's media
    const accessRes = await request.get(`${API}/businesses/${biz2.id}/media/${assetA.id}`, {
      headers: { Authorization: `Bearer ${session2.token}` },
    });
    expect(accessRes.status()).toBe(404);

    // Business B cannot use Business A's media file
    const fileRes = await request.get(`${API}/businesses/${biz2.id}/media/${assetA.id}/file`, {
      headers: { Authorization: `Bearer ${session2.token}` },
    });
    expect(fileRes.status()).toBe(404);
  });

  test("video configuration validation", async ({ request }) => {
    const email = `vidcfg-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Video Config" },
    });
    const session = (await signup.json()).data;
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: "Video Config Biz" },
    });
    const business = (await bizRes.json()).data;

    // Upload a video
    const upload = await request.post(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
      multipart: {
        file: { name: "bg.mp4", mimeType: "video/mp4", buffer: Buffer.from("video-data") },
      },
    });
    expect(upload.ok()).toBeTruthy();
    const video = (await upload.json()).data;

    // Store video background config in a section's styleConfig
    const websiteRes = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const website = (await websiteRes.json()).data;
    const page = website.pages[0];

    const bgConfig = {
      type: "video",
      assetId: video.id,
      src: video.signedUrl,
      opacity: 85,
      brightness: 110,
      contrast: 95,
      saturation: 100,
      blur: 2,
      grayscale: 0,
      hueRotate: 15,
      fit: "cover",
      position: "center",
      autoplay: true,
      muted: true,
      loop: true,
      poster: "",
      posterAssetId: null,
      overlay: {
        enabled: true,
        color: "#000000",
        opacity: 35,
      },
    };

    // Patch section with video background
    const patchRes = await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
      data: {
        pages: [{
          id: page.id,
          title: page.title,
          slug: page.slug,
          sortOrder: page.sortOrder,
          sections: page.sections.map((s: any) => ({
            id: s.id,
            sectionType: s.sectionType,
            sortOrder: s.sortOrder,
            content: JSON.parse(s.content || "{}"),
            styleConfig: {
              ...JSON.parse(s.styleConfig || "{}"),
              backgroundMedia: bgConfig,
            },
          })),
        }],
      },
    });
    expect(patchRes.ok()).toBeTruthy();

    // Verify config persists
    const verifyRes = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const verifyWebsite = (await verifyRes.json()).data;
    const heroSection = verifyWebsite.pages[0].sections[0];
    const savedStyle = JSON.parse(heroSection.styleConfig || "{}");
    expect(savedStyle.backgroundMedia).toBeDefined();
    expect(savedStyle.backgroundMedia.assetId).toBe(video.id);
    expect(savedStyle.backgroundMedia.type).toBe("video");
    expect(savedStyle.backgroundMedia.opacity).toBe(85);
    expect(savedStyle.backgroundMedia.brightness).toBe(110);
    expect(savedStyle.backgroundMedia.contrast).toBe(95);
    expect(savedStyle.backgroundMedia.overlay.enabled).toBe(true);
    expect(savedStyle.backgroundMedia.overlay.opacity).toBe(35);
    expect(savedStyle.backgroundMedia.fit).toBe("cover");
    expect(savedStyle.backgroundMedia.autoplay).toBe(true);
    expect(savedStyle.backgroundMedia.muted).toBe(true);
    expect(savedStyle.backgroundMedia.loop).toBe(true);
  });

  test("rejected exe upload", async ({ request }) => {
    const email = `rej-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Reject Test" },
    });
    const session = (await signup.json()).data;
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: "Reject Biz" },
    });
    const business = (await bizRes.json()).data;

    const uploadRes = await request.post(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
      multipart: {
        file: { name: "virus.exe", mimeType: "application/x-executable", buffer: Buffer.from("MZ-header") },
      },
    });
    expect(uploadRes.status()).toBe(400);
  });

  test("SVG sanitization: script tags removed", async ({ request }) => {
    const email = `svg-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "SVG Test" },
    });
    const session = (await signup.json()).data;
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: "SVG Biz" },
    });
    const business = (await bizRes.json()).data;

    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('xss')</script><circle r="10"/></svg>`;
    const uploadRes = await request.post(`${API}/businesses/${business.id}/media`, {
      headers: { Authorization: `Bearer ${session.token}` },
      multipart: {
        file: { name: "icon.svg", mimeType: "image/svg+xml", buffer: Buffer.from(maliciousSvg) },
      },
    });
    expect(uploadRes.ok()).toBeTruthy();
    const asset = (await uploadRes.json()).data;
    expect(asset.mediaType).toBe("IMAGE");

    // Verify stored file has no script tags
    const fileRes = await request.get(`${API}/businesses/${business.id}/media/${asset.id}/file`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const content = await fileRes.text();
    expect(content).not.toContain("<script>");
  });
});
