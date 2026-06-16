import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface MissSomaliEmailProps {
  fullName: string;
  title: string;
  message: string;
  notes?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export function MissSomaliEmail({
  fullName,
  title,
  message,
  notes,
  buttonText,
  buttonUrl,
}: MissSomaliEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Miss Somali 2026</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Dear {fullName},</Text>
            <Text style={text}>{message}</Text>

            {notes && (
              <Section style={notesBox}>
                <Text style={notesTitle}>Message from selection committee:</Text>
                <Text style={notesText}>"{notes}"</Text>
              </Section>
            )}

            {buttonText && buttonUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={buttonUrl}>
                  {buttonText}
                </Button>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Miss Somali Pageant Committee &copy; 2026</Text>
            <Text style={footerText}>Celebrating beauty, culture, and leadership.</Text>
            <Text style={footerLinkContainer}>
              Need support? Contact us at{" "}
              <Link style={yellowLink} href="mailto:info@misssomali.com">
                info@misssomali.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#020617", // Black/blue background
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#0f172a", // Dark blue card container
  border: "1px solid #1e293b",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "580px",
  overflow: "hidden",
};

const header = {
  backgroundColor: "#090d16", // Even darker headers
  borderBottom: "3px solid #fbbf24", // Yellow border accent (under 5% visual footprint)
  padding: "30px 20px",
  textAlign: "center" as const,
};

const logo = {
  color: "#f8fafc",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "2px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const contentSection = {
  padding: "40px 30px",
};

const greeting = {
  color: "#f8fafc",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
};

const text = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const notesBox = {
  backgroundColor: "#1e293b", // Slate background for notes
  borderLeft: "4px solid #fbbf24", // Yellow border accent
  borderRadius: "0 8px 8px 0",
  margin: "25px 0",
  padding: "15px 20px",
};

const notesTitle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "0 0 5px 0",
  textTransform: "uppercase" as const,
};

const notesText = {
  color: "#f8fafc",
  fontSize: "15px",
  fontStyle: "italic",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0 10px 0",
};

const button = {
  backgroundColor: "#fbbf24", // Yellow background (under 5% visual footprint)
  borderRadius: "6px",
  color: "#020617",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
};

const footer = {
  backgroundColor: "#090d16",
  borderTop: "1px solid #1e293b",
  padding: "30px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const footerLinkContainer = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0",
};

const yellowLink = {
  color: "#fbbf24", // Yellow links
  textDecoration: "underline",
};
