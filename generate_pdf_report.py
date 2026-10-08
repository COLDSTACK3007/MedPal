import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "MedPal (GramCare AI)  |  Product Specification & Technical Architecture")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        
        self.drawString(54, 32, "Confidential — MedPal Digital Health Systems")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom palette
    PRIMARY = colors.HexColor("#0f766e")     # Deep Teal
    PRIMARY_LIGHT = colors.HexColor("#f0fdfa") # Teal Glow Tint
    SECONDARY = colors.HexColor("#0f172a")   # Slate 900
    TEXT_MAIN = colors.HexColor("#1e293b")   # Slate 800
    TEXT_MUTED = colors.HexColor("#64748b")  # Slate 500
    BORDER_COLOR = colors.HexColor("#cbd5e1")
    ALERT_CORAL = colors.HexColor("#e11d48")
    ALERT_BG = colors.HexColor("#fff1f2")

    # Typography styles
    styles.add(ParagraphStyle(
        name='DocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name='DocSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=TEXT_MUTED,
        spaceAfter=15
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=SECONDARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='SubSectionHeader',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='BodyCustom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_MAIN,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name='BulletCustom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name='CalloutText',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=SECONDARY
    ))

    styles.add(ParagraphStyle(
        name='TableHead',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MAIN,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=SECONDARY,
        alignment=0
    ))

    story = []

    # -------------------------------------------------------------
    # COVER / HEADER BANNER
    # -------------------------------------------------------------
    story.append(Paragraph("MedPal (GramCare AI)", styles['DocTitle']))
    story.append(Paragraph("Comprehensive Product Specification, System Architecture & Technical Implementation Report", styles['DocSubtitle']))
    
    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Version:</b> 2.0.0 (Production)", styles['TableCell']),
            Paragraph("<b>Platform:</b> Fullstack Vercel WebApp + API", styles['TableCell']),
            Paragraph("<b>Database:</b> Neon Serverless PostgreSQL", styles['TableCell'])
        ],
        [
            Paragraph("<b>Target Audience:</b> Patients, CHWs, Clinicians", styles['TableCell']),
            Paragraph("<b>Engine:</b> Google Gemini 2.5 Flash + Local Fallback", styles['TableCell']),
            Paragraph("<b>Status:</b> Deployed & Active", styles['TableCell'])
        ]
    ]
    meta_table = Table(meta_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#99f6e4")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#ccfbf1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # -------------------------------------------------------------
    story.append(Paragraph("1. Problem Statement & Clinical Landscape", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))
    
    story.append(Paragraph(
        "Modern healthcare delivery in developing and rural regions faces severe structural bottlenecks. "
        "MedPal addresses four fundamental pain points observed across community health environments:",
        styles['BodyCustom']
    ))

    problems = [
        ("Disproportionate Doctor-to-Patient Ratios: ", 
         "Rural health sub-centers and primary health centers (PHCs) operate with critical specialist shortages. Community Health Workers (CHWs / ASHA workers) lack intelligent diagnostic co-pilots during household door-to-door screenings."),
        ("The 'Connectivity Paradox': ", 
         "Existing cloud-based telemedicine and electronic health record (EHR) platforms fail catastrophically in rural areas due to intermittent cellular or Wi-Fi connectivity. When internet drops, traditional healthcare apps become inaccessible."),
        ("Emergency Response & Communication Vacuum: ", 
         "When acute health crises occur (cardiac distress, respiratory collapse, trauma), isolated patients and the elderly have no automated distress mechanism to transmit both their live GPS location and clinical telemetry to family guardians."),
        ("Diagnostic Blindness & Fragmented Paper Records: ", 
         "Patient health histories are recorded across disorganized paper prescriptions and lab slips. Clinicians lack longitudinal diagnostic timelines, medication reconciliation, and interaction warnings, resulting in preventable diagnostic errors.")
    ]
    for title, desc in problems:
        story.append(Paragraph(f"• <b>{title}</b>{desc}", styles['BulletCustom']))
    
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 2. SOLUTION OF APPROACH
    # -------------------------------------------------------------
    story.append(Paragraph("2. Strategic Solution of Approach", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))

    story.append(Paragraph(
        "MedPal (GramCare AI) resolves these challenges through an <b>offline-first, emergency-enabled, AI-augmented healthcare architecture</b>:",
        styles['BodyCustom']
    ))

    solutions = [
        ("Offline-First Resilience with IndexedDB & LocalForage: ", 
         "All patient vitals, medications, and visits are cached locally in the browser/client storage. The application remains 100% operational in zero-connectivity environments and automatically queues synchronization batches for central PostgreSQL when connectivity returns."),
        ("One-Click Autonomous SOS Panic Protocol: ", 
         "A prominent, touch-optimized SOS emergency trigger captures high-precision browser GPS coordinates, compiles the patient's latest vital signs and profile, and automatically dispatches priority alert emails with live Google Maps links to registered guardians via Nodemailer SMTP."),
        ("MedTrace Multi-Modal Clinical Diagnostic Engine: ", 
         "A deep clinical reasoning module that reconstructs multi-event patient timelines, analyzes lab reference ranges with abnormal flags, evaluates drug-drug interactions, and derives ranked probabilistic differential diagnoses using Google Gemini AI with deterministic local rule fallbacks."),
        ("Dual-Persona Adaptive Experience: ", 
         "Role-based routing presents a personalized, reassuring health tracking dashboard for Patients (pill counters, refill warnings, vitals logging) while empowering CHWs with community health rosters, batch sync controllers, and emergency indicators."),
        ("Decentralized Health Vault & Facility Geo-Discovery: ", 
         "Equips patients with a secure digital locker for lab slips, prescriptions, and ID cards, coupled with live Overpass API geo-spatial querying to dynamically discover nearby hospitals, clinics, and trauma centers.")
    ]
    for title, desc in solutions:
        story.append(Paragraph(f"• <b>{title}</b>{desc}", styles['BulletCustom']))

    story.append(Spacer(1, 12))

    # -------------------------------------------------------------
    # 3. TECHNOLOGY STACK USED
    # -------------------------------------------------------------
    story.append(Paragraph("3. Technology Stack & Architectural Decisions", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))

    tech_table_data = [
        [Paragraph("Layer", styles['TableHead']), Paragraph("Technology / Library", styles['TableHead']), Paragraph("Architectural Rationale & Purpose", styles['TableHead'])],
        [
            Paragraph("Frontend Framework", styles['TableCellBold']),
            Paragraph("React 19 + TypeScript (Vite 7)", styles['TableCell']),
            Paragraph("Cutting-edge React 19 concurrent features, lightning-fast HMR via Vite, strict type safety.", styles['TableCell'])
        ],
        [
            Paragraph("Styling & Design", styles['TableCellBold']),
            Paragraph("TailwindCSS v4 + Glassmorphism", styles['TableCell']),
            Paragraph("Zero-runtime utility CSS, dynamic mesh-gradient backgrounds, accessible touch targets (≥44px).", styles['TableCell'])
        ],
        [
            Paragraph("Data Visualization", styles['TableCellBold']),
            Paragraph("Recharts", styles['TableCell']),
            Paragraph("Responsive vector charts for Blood Pressure, Heart Rate, Glucose, and Temperature telemetry.", styles['TableCell'])
        ],
        [
            Paragraph("Mapping & Geo", styles['TableCellBold']),
            Paragraph("Leaflet + React-Leaflet + Overpass API", styles['TableCell']),
            Paragraph("Lightweight mapping using OpenStreetMap tiles; live API discovery of nearby emergency hospitals.", styles['TableCell'])
        ],
        [
            Paragraph("Backend API", styles['TableCellBold']),
            Paragraph("Node.js + Express 5.x", styles['TableCell']),
            Paragraph("Clean RESTful micro-endpoints; dual execution (local persistent daemon + Vercel serverless function).", styles['TableCell'])
        ],
        [
            Paragraph("Database", styles['TableCellBold']),
            Paragraph("Neon Serverless PostgreSQL", styles['TableCell']),
            Paragraph("Auto-scaling serverless Postgres with pgBouncer pooling; prevents connection limits in serverless.", styles['TableCell'])
        ],
        [
            Paragraph("Database ORM", styles['TableCellBold']),
            Paragraph("Prisma ORM v7 (@prisma/adapter-pg)", styles['TableCell']),
            Paragraph("Type-safe database client utilizing the modern PostgreSQL driver adapter for connection pooling.", styles['TableCell'])
        ],
        [
            Paragraph("Artificial Intelligence", styles['TableCellBold']),
            Paragraph("Google Gemini 2.5 Flash (@google/genai)", styles['TableCell']),
            Paragraph("Low-latency multi-modal clinical triage, differential diagnoses, and fitness nutrition planning.", styles['TableCell'])
        ],
        [
            Paragraph("Emergency Dispatch", styles['TableCellBold']),
            Paragraph("Nodemailer (SMTP / Gmail)", styles['TableCell']),
            Paragraph("Instant multi-recipient HTML emergency broadcast with patient vitals and Google Maps coordinates.", styles['TableCell'])
        ],
        [
            Paragraph("Deployment & Monorepo", styles['TableCellBold']),
            Paragraph("Vercel Unified Monorepo (vercel.json)", styles['TableCell']),
            Paragraph("Single-domain deployment for SPA and serverless API; eliminates CORS configuration completely.", styles['TableCell'])
        ]
    ]

    t_tech = Table(tech_table_data, colWidths=[100, 150, 254])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 4. KEY FUNCTIONAL MODULES BREAKDOWN
    # -------------------------------------------------------------
    story.append(Paragraph("4. Key Functional Modules & User Workflows", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))

    modules = [
        ("4.1 Role-Adaptive Dashboards (/ and /dashboard)", [
            "<b>Patient Dashboard (UserDashboard.tsx):</b> Features a high-contrast emergency SOS panic button, live vitals summary, medication countdown timers, and rapid navigation cards.",
            "<b>CHW / Admin Dashboard (Dashboard.tsx):</b> Displays population health analytics, community patient census, critical flagged cases, and central synchronization status."
        ]),
        ("4.2 One-Click SOS Emergency Protocol (/api/emergency/email)", [
            "Captures precise client GPS coordinates via browser geolocation API.",
            "Compiles real-time patient metadata (age, gender, contact, blood pressure, vitals snapshot).",
            "Dispatches high-priority HTML alert emails with clickable Google Maps directions to all registered guardians using Nodemailer SMTP."
        ]),
        ("4.3 MedTrace Diagnostic & Differential Engine (/medtrace)", [
            "<b>Chronological Timeline Builder:</b> Compiles illness onset, progression, and multi-visit clinical events.",
            "<b>Lab Parameter Flags:</b> Cross-references lab results with biological reference ranges, highlighting abnormal values.",
            "<b>Medication Reconciliation:</b> Identifies potential contraindications and drug interactions.",
            "<b>Reasoning Engine:</b> Combines Google Gemini AI with deterministic local rule fallbacks to output ranked differential diagnoses with percentage confidence, evidence tokens, and red flags."
        ]),
        ("4.4 AI Health & Wellness Companion (/companion)", [
            "<b>Medical Triage Mode:</b> Analyzes natural language patient symptoms, stratifies risk (LOW, MEDIUM, HIGH), and delivers immediate first-aid instructions with safety disclaimers.",
            "<b>Fitness & Wellness Mode:</b> Calculates BMI/BMR/TDEE and generates tailored exercise routines, progressive overload splits, yoga asana regimens, and nutrition macro splits."
        ]),
        ("4.5 Smart Medical Tracker (/tracker)", [
            "<b>Prescription Schedule:</b> Tracks dosage, frequency (1x, 2x, 3x daily), dietary conditions (Before/After Food), and specific consumption times.",
            "<b>Inventory & Refill Alerts:</b> Automated countdown counter that triggers visual warnings when pill supply drops below safe thresholds.",
            "<b>Hospital Check-up Planner:</b> Logs upcoming clinic visits, appointment dates, and hospital departments."
        ]),
        ("4.6 Health Vitals Telemetry (/vitals)", [
            "Renders interactive time-series charts for Systolic/Diastolic BP, Blood Glucose, Heart Rate, and Temperature using Recharts.",
            "Provides an intuitive modal for logging new telemetry with immediate client-side trend re-rendering."
        ]),
        ("4.7 Secure Medical Document Vault (/vault)", [
            "Encrypted digital locker categorizing health documents into Lab Reports, Prescriptions, Vaccinations, and ID Cards.",
            "Supports client file uploads, MIME-type validation, file size calculation, in-browser previews, and local downloads."
        ]),
        ("4.8 Live Hospital & Facility Finder (/hospitals)", [
            "Interactive Leaflet mapping initialized at the user's current GPS location.",
            "Executes dynamic queries to the OpenStreetMap Overpass API to locate nearby medical facilities, trauma centers, and pharmacies.",
            "Displays facility phone numbers, direct calling, and navigation routes."
        ]),
        ("4.9 Appointments & Telemedicine Suite (/appointments & /telemedicine)", [
            "Directory of accredited hospital networks (Apollo, Meenakshi Mission) with department filtering and slot booking.",
            "Telemedicine options for HD video consults, low-bandwidth audio calling, and asynchronous specialist messaging."
        ]),
        ("4.10 Central Database Synchronization (/records & /api/sync)", [
            "CHW patient records roster backed by IndexedDB/LocalForage.",
            "Batched upsert synchronization to Neon PostgreSQL with Prisma transaction pooling."
        ])
    ]

    for mod_title, mod_items in modules:
        story.append(Paragraph(mod_title, styles['SubSectionHeader']))
        for item in mod_items:
            story.append(Paragraph(f"• {item}", styles['BulletCustom']))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 5. DATA ARCHITECTURE & API CONTRACTS
    # -------------------------------------------------------------
    story.append(Paragraph("5. Data Architecture & API Specifications", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))

    story.append(Paragraph(
        "<b>Prisma PostgreSQL Schema (Deployed to Neon):</b>",
        styles['BodyCustom']
    ))
    
    schema_code = (
        "model PatientRecord {<br/>"
        "&nbsp;&nbsp;id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;String&nbsp;&nbsp;&nbsp;@id @default(uuid())<br/>"
        "&nbsp;&nbsp;patientId&nbsp;String&nbsp;&nbsp;&nbsp;@unique<br/>"
        "&nbsp;&nbsp;name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;String<br/>"
        "&nbsp;&nbsp;age&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Int<br/>"
        "&nbsp;&nbsp;gender&nbsp;&nbsp;&nbsp;&nbsp;String<br/>"
        "&nbsp;&nbsp;village&nbsp;&nbsp;&nbsp;String<br/>"
        "&nbsp;&nbsp;lastVisit String<br/>"
        "&nbsp;&nbsp;createdAt DateTime @default(now())<br/>"
        "&nbsp;&nbsp;updatedAt DateTime @updatedAt<br/>"
        "}"
    )
    story.append(Paragraph(schema_code, styles['CalloutText']))
    story.append(Spacer(1, 6))

    api_table_data = [
        [Paragraph("Endpoint", styles['TableHead']), Paragraph("Method", styles['TableHead']), Paragraph("Payload / Purpose", styles['TableHead']), Paragraph("Response Status", styles['TableHead'])],
        [
            Paragraph("/api/health", styles['TableCellBold']),
            Paragraph("GET", styles['TableCell']),
            Paragraph("Verifies backend status and Gemini AI readiness.", styles['TableCell']),
            Paragraph("200 OK (aiEnabled: true)", styles['TableCell'])
        ],
        [
            Paragraph("/api/companion/chat", styles['TableCellBold']),
            Paragraph("POST", styles['TableCell']),
            Paragraph("Receives message, triage/fitness mode, and context; returns Gemini AI reply.", styles['TableCell']),
            Paragraph("200 OK (reply, source)", styles['TableCell'])
        ],
        [
            Paragraph("/api/emergency/email", styles['TableCellBold']),
            Paragraph("POST", styles['TableCell']),
            Paragraph("Dispatches emergency SOS emails with GPS coords to guardian emails.", styles['TableCell']),
            Paragraph("200 OK (alert sent)", styles['TableCell'])
        ],
        [
            Paragraph("/api/sync", styles['TableCellBold']),
            Paragraph("POST", styles['TableCell']),
            Paragraph("Upserts batched offline patient records into Neon PostgreSQL via Prisma.", styles['TableCell']),
            Paragraph("200 OK (count: N)", styles['TableCell'])
        ],
        [
            Paragraph("/api/fitness/recommend", styles['TableCellBold']),
            Paragraph("POST", styles['TableCell']),
            Paragraph("Computes BMI, weight category, and wellness routines.", styles['TableCell']),
            Paragraph("200 OK (bmi, category)", styles['TableCell'])
        ]
    ]

    t_api = Table(api_table_data, colWidths=[110, 50, 224, 120])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 6. LATEST CHANGES & DEPLOYMENT ENHANCEMENTS
    # -------------------------------------------------------------
    story.append(Paragraph("6. Latest Changes & Production Enhancements", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=8, spaceBefore=0))

    story.append(Paragraph(
        "During the latest release iteration, the platform underwent architectural modernization to ensure high availability, zero-friction deployment, and serverless scalability:",
        styles['BodyCustom']
    ))

    changes = [
        ("Neon Serverless PostgreSQL Integration: ", 
         "Migrated database infrastructure to Neon's AWS-hosted serverless PostgreSQL instance. Configured both pooled connection string (ep-restless-glade-b321t0h4-pooler) for serverless execution and direct connection string for schema migrations."),
        ("Prisma v7 Driver Adapter Upgrade: ", 
         "Resolved Prisma 7 instantiation requirements by installing and configuring '@prisma/adapter-pg' and 'pg' connection pooling. Successfully verified table push (npx prisma db push) and live record queries."),
        ("Unified Vercel Monorepo Deployment Setup: ", 
         "Implemented root vercel.json orchestrating automated building of both the backend Prisma client and frontend Vite bundle (npm run build). Configured root api/index.js routing all /api/* requests to Express serverless handlers while serving the React SPA."),
        ("Dynamic Zero-Config API Base URL (config.ts): ", 
         "Implemented environment-adaptive API routing. In local development, the app connects to port 3001; in production on Vercel, it defaults to same-origin relative URLs (/api/...), completely eliminating CORS restrictions."),
        ("React 19 & TypeScript Strict Mode Compliance: ", 
         "Eliminated all verbatimModuleSyntax type import errors in AuthContext.tsx, resolved Lucide React SVG tooltip attributes in Records.tsx, and cleaned all unused parameters in Tracker.tsx and Telemedicine.tsx."),
        ("Git Version Control & Repository Synchronization: ", 
         "Cleanly committed all configuration, adapter, and frontend updates to the main branch and synchronized with GitHub repository (https://github.com/praneshMS-2007/MedPal.git).")
    ]
    for title, desc in changes:
        story.append(Paragraph(f"• <b>{title}</b>{desc}", styles['BulletCustom']))

    story.append(Spacer(1, 14))

    # Conclusion Card
    conclusion_box = [
        [Paragraph("<b>Production Status Summary:</b> MedPal is 100% configured for production launch. The frontend Vite bundle compiles with zero errors, the Express API is serverless-ready for Vercel, and the Neon PostgreSQL database is active and accepting synchronized clinical telemetry.", styles['CalloutText'])]
    ]
    t_concl = Table(conclusion_box, colWidths=[504])
    t_concl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_concl)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {filename}")

if __name__ == '__main__':
    output_pdf = os.path.join(r"e:\PROJECTS\medic-main", "MedPal_Comprehensive_Project_Report.pdf")
    build_pdf(output_pdf)
