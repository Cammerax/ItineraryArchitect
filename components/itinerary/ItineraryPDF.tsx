import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface Activity {
  id?: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location?: string | null;
  type?: string | null;
  tips?: string | null;
  order: number;
}

interface Day {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: Activity[];
}

interface ItineraryPDFProps {
  itinerary: {
    title: string;
    slug: string;
    summary: string;
    price: number;
    duration: number;
    location: { name: string; continent: string; country?: string | null; city?: string | null };
    category: { name: string };
    days: Day[];
  };
  highlights: string[];
  includes: string[];
  excludes: string[];
}

const C = {
  sage:       "#d97706",
  amberDark:   "#92400e",
  amberLight:  "#fef3c7",
  amberMid:    "#f59e0b",
  stone900:    "#1c1917",
  stone800:    "#292524",
  stone700:    "#44403c",
  stone600:    "#57534e",
  stone500:    "#78716c",
  stone400:    "#a8a29e",
  stone300:    "#d6d3d1",
  stone200:    "#e7e5e4",
  stone100:    "#f5f5f4",
  stone50:     "#fafaf9",
  white:       "#ffffff",
  green:       "#16a34a",
  greenLight:  "#dcfce7",
  red:         "#dc2626",
  redLight:    "#fee2e2",
  blue:        "#3b82f6",
  blueLight:   "#dbeafe",
  purple:      "#8b5cf6",
  purpleLight: "#ede9fe",
  emerald:     "#059669",
  emeraldLight:"#d1fae5",
};

const ACTIVITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  attraction:   { bg: C.amberLight,   text: C.amberDark,  label: "ATTRACTION"    },
  restaurant:   { bg: C.greenLight,   text: C.green,      label: "DINING"        },
  transport:    { bg: C.blueLight,    text: C.blue,       label: "TRANSPORT"     },
  accommodation:{ bg: C.purpleLight,  text: C.purple,     label: "STAY"          },
  outdoors:     { bg: C.emeraldLight, text: C.emerald,    label: "OUTDOORS"      },
  break:        { bg: C.stone100,     text: C.stone600,   label: "LEISURE"       },
};

function getActivityColor(type?: string | null) {
  return ACTIVITY_COLORS[type || ""] || ACTIVITY_COLORS.attraction;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function calcDuration(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

const s = StyleSheet.create({
  // ─── Cover ────────────────────────────────────────────────────────────────
  cover:            { flex: 1, backgroundColor: C.white },
  coverTopBar:      { height: 8, backgroundColor: C.sage },
  coverBody:        { flex: 1, padding: 48, paddingTop: 64, justifyContent: "space-between" },
  coverTopSection:  { flex: 1, justifyContent: "center" },
  coverEyebrow:     { fontSize: 9, letterSpacing: 3, color: C.sage, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  coverTitle:       { fontSize: 34, fontFamily: "Helvetica-Bold", color: C.stone900, lineHeight: 1.15, marginBottom: 12 },
  coverSubtitle:    { fontSize: 14, color: C.stone600, fontFamily: "Helvetica", marginBottom: 28 },
  coverMeta:        { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 40 },
  coverMetaBadge:   { backgroundColor: C.amberLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  coverMetaText:    { fontSize: 9, color: C.amberDark, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  coverDivider:     { height: 1, backgroundColor: C.stone200, marginBottom: 24 },
  coverBrand:       { fontSize: 8, letterSpacing: 2, color: C.stone400, fontFamily: "Helvetica-Bold" },
  coverBrandName:   { fontSize: 11, letterSpacing: 3, color: C.stone800, fontFamily: "Helvetica-Bold", marginTop: 2 },
  coverDisclaimer:  { fontSize: 7, color: C.stone400, marginTop: 8, fontFamily: "Helvetica" },
  coverPriceBox:    { backgroundColor: C.stone50, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: C.stone200, marginBottom: 32 },
  coverPriceLabel:  { fontSize: 8, color: C.stone400, fontFamily: "Helvetica", letterSpacing: 1, marginBottom: 4 },
  coverPriceValue:  { fontSize: 28, fontFamily: "Helvetica-Bold", color: C.sage },
  coverPriceSub:    { fontSize: 8, color: C.stone500, fontFamily: "Helvetica", marginTop: 2 },

  // ─── Overview page ────────────────────────────────────────────────────────
  page:             { padding: 48, backgroundColor: C.white },
  pageHeader:       { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  pageSectionLabel: { fontSize: 7, letterSpacing: 2.5, color: C.sage, fontFamily: "Helvetica-Bold" },
  pageDivider:      { height: 1, flex: 1, backgroundColor: C.stone200, marginLeft: 10, marginTop: 1 },
  sectionGap:       { height: 24 },
  smallGap:         { height: 12 },
  tinyGap:          { height: 6 },

  // summary
  summaryText:      { fontSize: 11, color: C.stone700, lineHeight: 1.6, fontFamily: "Helvetica" },

  // highlights
  highlightRow:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  highlightDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: C.sage, marginTop: 3, marginRight: 8 },
  highlightText:    { fontSize: 10, color: C.stone700, fontFamily: "Helvetica", flex: 1, lineHeight: 1.5 },

  // includes / excludes
  includeExcludeRow:{ flexDirection: "row", gap: 24 },
  includeCol:       { flex: 1 },
  includeLabel:     { fontSize: 7, letterSpacing: 1.5, color: C.green, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  excludeLabel:     { fontSize: 7, letterSpacing: 1.5, color: C.red, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  includeRow:       { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  includeCheck:     { fontSize: 9, color: C.green, marginRight: 6, marginTop: 1 },
  excludeX:         { fontSize: 9, color: C.red, marginRight: 6, marginTop: 1 },
  includeText:      { fontSize: 9, color: C.stone700, fontFamily: "Helvetica", flex: 1, lineHeight: 1.5 },

  // ─── Day pages ────────────────────────────────────────────────────────────
  dayHeader:        { marginBottom: 16 },
  dayNumberBadge:   { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dayNumber:        { fontSize: 7, letterSpacing: 2.5, color: C.white, fontFamily: "Helvetica-Bold", backgroundColor: C.sage, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3 },
  dayTitle:         { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.stone900, marginBottom: 4 },
  dayDesc:          { fontSize: 9, color: C.stone500, fontFamily: "Helvetica", lineHeight: 1.5 },

  // activity
  activityBox:      { marginBottom: 2, borderBottomWidth: 1, borderBottomColor: C.stone100, paddingBottom: 14, marginTop: 14 },
  activityRow:      { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  activityTimeCol:  { width: 52, flexShrink: 0 },
  activityTime:     { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.stone800 },
  activityTimeSep:  { fontSize: 7, color: C.stone400, marginVertical: 1 },
  activityEnd:      { fontSize: 9, color: C.stone500, fontFamily: "Helvetica" },
  activityDur:      { fontSize: 7, color: C.stone400, fontFamily: "Helvetica", marginTop: 2 },
  activityContent:  { flex: 1 },
  activityTypeRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  activityTypeBadge:{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  activityTypeText: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.8 },
  activityTitle:    { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.stone900, lineHeight: 1.3 },
  activityDesc:     { fontSize: 9, color: C.stone600, fontFamily: "Helvetica", lineHeight: 1.55, marginTop: 4 },
  activityLocation: { flexDirection: "row", alignItems: "flex-start", marginTop: 5 },
  activityLocPin:   { fontSize: 8, color: C.stone400, marginRight: 4 },
  activityLocText:  { fontSize: 8, color: C.stone500, fontFamily: "Helvetica", flex: 1 },
  activityTipBox:   { backgroundColor: C.amberLight, borderLeftWidth: 3, borderLeftColor: C.amberMid, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 3, marginTop: 6 },
  activityTipLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.amberDark, letterSpacing: 0.5, marginBottom: 2 },
  activityTipText:  { fontSize: 8, color: C.amberDark, fontFamily: "Helvetica", lineHeight: 1.5 },

  // footer
  footer:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.stone200 },
  footerLeft:       { fontSize: 7, color: C.stone400, fontFamily: "Helvetica" },
  footerRight:      { fontSize: 7, color: C.stone400, fontFamily: "Helvetica" },
  footerBrand:      { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.stone500 },

  // disclaimer page
  disclaimerPage:   { padding: 48, backgroundColor: C.stone50, flex: 1, justifyContent: "center", alignItems: "center" },
  disclaimerTitle:  { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.stone700, letterSpacing: 1, marginBottom: 12 },
  disclaimerText:   { fontSize: 9, color: C.stone500, fontFamily: "Helvetica", lineHeight: 1.7, textAlign: "center", maxWidth: 400 },
  disclaimerBrand:  { marginTop: 32, fontSize: 8, letterSpacing: 2, color: C.stone400, fontFamily: "Helvetica-Bold" },
});

function PageFooter({ title, page, total }: { title: string; page: number; total: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>{title}</Text>
      <Text style={[s.footerRight, s.footerBrand]}>THE ITINERARY ARCHITECT</Text>
      <Text style={s.footerRight}>Page {page} of {total}</Text>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageSectionLabel}>{text}</Text>
      <View style={s.pageDivider} />
    </View>
  );
}

export function ItineraryPDF({ itinerary, highlights, includes, excludes }: ItineraryPDFProps) {
  const totalPages = 2 + itinerary.days.length + 1;

  return (
    <Document
      title={itinerary.title}
      author="The Itinerary Architect"
      subject={`Travel itinerary for ${itinerary.location.name}`}
      keywords="travel, itinerary, vacation"
    >
      {/* ── Page 1: Cover ─────────────────────────────────────────────────── */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverTopBar} />
        <View style={s.coverBody}>
          <View style={s.coverTopSection}>
            <Text style={s.coverEyebrow}>TRAVEL ITINERARY</Text>
            <Text style={s.coverTitle}>{itinerary.title}</Text>
            <Text style={s.coverSubtitle}>{itinerary.summary}</Text>
            <View style={s.coverMeta}>
              <View style={s.coverMetaBadge}>
                <Text style={s.coverMetaText}>{itinerary.location.name.toUpperCase()}</Text>
              </View>
              <View style={s.coverMetaBadge}>
                <Text style={s.coverMetaText}>{itinerary.duration} {itinerary.duration === 1 ? "DAY" : "DAYS"}</Text>
              </View>
              <View style={s.coverMetaBadge}>
                <Text style={s.coverMetaText}>{itinerary.category.name.toUpperCase()}</Text>
              </View>
            </View>
            <View style={s.coverPriceBox}>
              <Text style={s.coverPriceLabel}>GUIDE PRICE</Text>
              <Text style={s.coverPriceValue}>{formatPrice(itinerary.price)}</Text>
              <Text style={s.coverPriceSub}>One-time purchase · Lifetime access · Day-by-day planning guide</Text>
            </View>
          </View>
          <View>
            <View style={s.coverDivider} />
            <Text style={s.coverBrand}>PREPARED EXCLUSIVELY BY</Text>
            <Text style={s.coverBrandName}>THE ITINERARY ARCHITECT</Text>
            <Text style={s.coverDisclaimer}>
              This document is a planning guide only. The Itinerary Architect is not a travel agency.
              No flights, accommodations, tickets, or bookings are arranged on your behalf.
              All reservations and bookings remain your responsibility.
            </Text>
          </View>
        </View>
      </Page>

      {/* ── Page 2: Overview ──────────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <SectionLabel text="TRIP OVERVIEW" />
        <View style={s.smallGap} />
        <Text style={s.summaryText}>{itinerary.summary}</Text>

        {highlights.length > 0 && (
          <>
            <View style={s.sectionGap} />
            <SectionLabel text="HIGHLIGHTS" />
            <View style={s.smallGap} />
            {highlights.map((h, i) => (
              <View key={i} style={s.highlightRow}>
                <View style={s.highlightDot} />
                <Text style={s.highlightText}>{h}</Text>
              </View>
            ))}
          </>
        )}

        {(includes.length > 0 || excludes.length > 0) && (
          <>
            <View style={s.sectionGap} />
            <SectionLabel text="WHAT'S INCLUDED" />
            <View style={s.smallGap} />
            <View style={s.includeExcludeRow}>
              {includes.length > 0 && (
                <View style={s.includeCol}>
                  <Text style={s.includeLabel}>INCLUDED IN YOUR GUIDE</Text>
                  {includes.map((item, i) => (
                    <View key={i} style={s.includeRow}>
                      <Text style={s.includeCheck}>✓</Text>
                      <Text style={s.includeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {excludes.length > 0 && (
                <View style={s.includeCol}>
                  <Text style={s.excludeLabel}>NOT INCLUDED</Text>
                  {excludes.map((item, i) => (
                    <View key={i} style={s.includeRow}>
                      <Text style={s.excludeX}>✗</Text>
                      <Text style={s.includeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />
        <View style={s.footer}>
          <Text style={s.footerLeft}>{itinerary.title}</Text>
          <Text style={[s.footerRight, s.footerBrand]}>THE ITINERARY ARCHITECT</Text>
          <Text style={s.footerRight}>Page 2</Text>
        </View>
      </Page>

      {/* ── Day Pages ─────────────────────────────────────────────────────── */}
      {itinerary.days.map((day, dayIdx) => (
        <Page key={day.id} size="A4" style={s.page}>
          <View style={s.dayHeader}>
            <View style={s.dayNumberBadge}>
              <Text style={s.dayNumber}>DAY {day.dayNumber}</Text>
            </View>
            <Text style={s.dayTitle}>{day.title}</Text>
            {day.description ? <Text style={s.dayDesc}>{day.description}</Text> : null}
          </View>

          {day.activities.map((act, actIdx) => {
            const typeColors = getActivityColor(act.type);
            const duration = calcDuration(act.startTime, act.endTime);
            return (
              <View key={actIdx} style={s.activityBox} wrap={false}>
                <View style={s.activityRow}>
                  {/* Time column */}
                  <View style={s.activityTimeCol}>
                    <Text style={s.activityTime}>{act.startTime}</Text>
                    <Text style={s.activityTimeSep}>|</Text>
                    <Text style={s.activityEnd}>{act.endTime}</Text>
                    {duration ? <Text style={s.activityDur}>{duration}</Text> : null}
                  </View>

                  {/* Content */}
                  <View style={s.activityContent}>
                    <View style={s.activityTypeRow}>
                      <View style={[s.activityTypeBadge, { backgroundColor: typeColors.bg }]}>
                        <Text style={[s.activityTypeText, { color: typeColors.text }]}>
                          {typeColors.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.activityTitle}>{act.title}</Text>
                    {act.description ? (
                      <Text style={s.activityDesc}>{act.description}</Text>
                    ) : null}
                    {act.location ? (
                      <View style={s.activityLocation}>
                        <Text style={s.activityLocPin}>•</Text>
                        <Text style={s.activityLocText}>{act.location}</Text>
                      </View>
                    ) : null}
                    {act.tips ? (
                      <View style={s.activityTipBox}>
                        <Text style={s.activityTipLabel}>INSIDER TIP</Text>
                        <Text style={s.activityTipText}>{act.tips}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}

          {day.activities.length === 0 && (
            <Text style={{ fontSize: 9, color: C.stone400, fontFamily: "Helvetica", marginTop: 8 }}>
              No activities planned for this day.
            </Text>
          )}

          <View style={{ flex: 1 }} />
          <View style={s.footer}>
            <Text style={s.footerLeft}>{itinerary.title}</Text>
            <Text style={[s.footerRight, s.footerBrand]}>THE ITINERARY ARCHITECT</Text>
            <Text style={s.footerRight}>Page {dayIdx + 3}</Text>
          </View>
        </Page>
      ))}

      {/* ── Final Page: Important Notes ───────────────────────────────────── */}
      <Page size="A4" style={s.disclaimerPage}>
        <View style={s.coverTopBar} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 48 }}>
          <Text style={s.disclaimerTitle}>IMPORTANT NOTES</Text>
          <Text style={s.disclaimerText}>
            This travel guide was prepared by The Itinerary Architect as a planning resource.
            All times, prices, and recommendations are provided as estimates and suggestions only.
            {"\n\n"}
            The Itinerary Architect is not a travel agency and does not book, arrange, or manage
            any travel services including flights, accommodation, tours, transport, or tickets.
            All bookings and reservations are the sole responsibility of the traveler.
            {"\n\n"}
            Prices and availability of attractions, restaurants, and services are subject to change.
            Always verify current information directly with providers before your trip.
            {"\n\n"}
            We hope this guide helps you create an unforgettable journey.
            Happy travels!
          </Text>
          <Text style={s.disclaimerBrand}>THE ITINERARY ARCHITECT</Text>
          <Text style={{ fontSize: 7, color: C.stone400, fontFamily: "Helvetica", marginTop: 4 }}>
            Not a travel agency · Planning guides only · itineraryarchitect.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}
