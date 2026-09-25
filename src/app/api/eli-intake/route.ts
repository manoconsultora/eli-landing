import { NextRequest, NextResponse } from "next/server";

const MAX_PROMPT_LENGTH = 1200;
const MAX_BODY_LENGTH = 16_000;
const ALLOWED_CATEGORIES = [
  "Soy Administrador",
  "Soy vecino",
  "Soy inversor",
] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type IntakeBody = {
  prompt?: string;
  category?: string;
  email?: string;
  source?: string;
};

export async function POST(request: NextRequest) {
  let body: IntakeBody;

  try {
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { ok: false, message: "La solicitud es demasiado grande." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { ok: false, message: "La solicitud es demasiado grande." },
        { status: 413 }
      );
    }

    body = JSON.parse(rawBody) as IntakeBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos interpretar la consulta enviada." },
      { status: 400 }
    );
  }

  const prompt = body.prompt?.trim() ?? "";
  const category = body.category?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!prompt) {
    return NextResponse.json(
      { ok: false, message: "La consulta no puede estar vacía." },
      { status: 400 }
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { ok: false, message: "La consulta es demasiado larga." },
      { status: 400 }
    );
  }

  if (!ALLOWED_CATEGORIES.includes(category as (typeof ALLOWED_CATEGORIES)[number])) {
    return NextResponse.json(
      {
        ok: false,
        message: "Seleccioná si sos Administrador, Vecino o Inversor antes de enviar.",
      },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Necesitamos un email válido para enviarte la confirmación.",
      },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.N8N_ELI_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_ELI_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "El módulo de consultas no está disponible temporalmente.",
      },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const payload = {
      source: "landing-cta",
      prompt,
      category,
      email,
      submittedAt: new Date().toISOString(),
      path: request.nextUrl.pathname,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-eli-source": "landing-cta",
        "x-eli-secret": webhookSecret,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "No pudimos procesar la consulta en este momento.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Consulta enviada correctamente a la automatización.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "La automatización tardó demasiado en responder."
        : "No pudimos contactar la automatización de n8n.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
