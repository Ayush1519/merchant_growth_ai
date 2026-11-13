import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Edit2,
  Instagram,
  Mail,
  Megaphone,
  MessageSquare,
  Plus,
  Rocket,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Campaign, CampaignChannel, CampaignStatus } from "@/lib/supabase/types";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "AI Marketing Center — Merchant Growth AI" },
      { name: "description", content: "Generate and launch high-converting marketing campaigns using AI." },
    ],
  }),
  component: CampaignsPage,
});

const CHANNELS: { id: CampaignChannel; label: string; icon: any }[] = [
  { id: "Instagram", label: "Instagram Post & Story", icon: Instagram },
  { id: "WhatsApp", label: "WhatsApp Broadcast", icon: MessageSquare },
  { id: "Email", label: "Email Newsletter", icon: Mail },
  { id: "SMS", label: "Direct SMS Text", icon: Send },
];

const GOALS = [
  "Boost Average Order Value (AOV)",
  "Re-engage Inactive / At-Risk Customers",
  "Promote New Product Arrival",
  "Weekend Flash Sale",
  "Holiday / Festival Special",
  "Customer Loyalty Appreciation",
];

const TONES = [
  "Friendly & Warm",
  "Inspiring & Aesthetic",
  "Urgent & Time-Sensitive",
  "Professional & Crisp",
  "Festive & Playful",
];

function CampaignsPage() {
  const { campaigns, products, business, addCampaign, updateCampaign, deleteCampaign } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Generator Form State
  const [channel, setChannel] = useState<CampaignChannel>("Instagram");
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("All Customers");
  const [offer, setOffer] = useState<string>("15% off using code BOOST15");
  const [tone, setTone] = useState<string>(TONES[0]);
  const [campaignName, setCampaignName] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setChannel("Instagram");
    setGoal(GOALS[0]);
    setSelectedProductId(products[0]?.id || "");
    setTargetAudience("All Customers");
    setOffer("15% off with code GROW15");
    setTone(TONES[0]);
    setCampaignName("Weekend Flash Promo");
    setGeneratedContent("");
    setDialogOpen(true);
  };

  const handleGenerateAI = () => {
    setGenerating(true);
    const store = business?.businessName || "our store";
    const prod = products.find((p) => p.id === selectedProductId);
    const prodName = prod ? prod.name : "our flagship collection";

    setTimeout(() => {
      let copy = "";
      if (channel === "Instagram") {
        copy = `✨ Elevate your everyday with ${prodName} at ${store}! ✨\n\nFor a limited time, treat yourself to our community favorite with ${offer}.\n\nHandcrafted with meticulous quality and built to last. Tap the link in our bio to shop the drop before inventory runs out! 🛍️\n\n#${store.replace(/\s+/g, "")} #${prodName.replace(/\s+/g, "")} #ShopSmall #QualityCraft #SpecialtyGoods`;
      } else if (channel === "WhatsApp") {
        copy = `Hi {customer_name}! 👋\n\nWe wanted to share a special VIP perk for you at *${store}*.\n\nEnjoy *${offer}* on *${prodName}* this week! \n\n👉 Shop now: https://${store.toLowerCase().replace(/\s+/g, "")}.com/shop\n\nReply to this message if you have any questions! ☕✨`;
      } else if (channel === "Email") {
        copy = `Subject: An exclusive invitation from ${store} 💌\n\nHi {First Name},\n\nWe're so grateful for your continued support of ${store}.\n\nAs a thank you, we're giving you early access to ${offer} on our best-selling ${prodName}.\n\nWhether you're restocking or trying something new, now is the perfect time.\n\n[Claim Your Perk Now] →\n\nWarm regards,\nThe team at ${store}`;
      } else {
        copy = `${store}: Special offer for you! Enjoy ${offer} on ${prodName}. Shop now before stock ends: https://bit.ly/store-vip`;
      }

      setGeneratedContent(copy);
      setGenerating(false);
      toast.success("AI copy generated! ✨");
    }, 600);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!generatedContent.trim()) {
      toast.error("Please generate or enter campaign copy");
      return;
    }

    if (editingCampaign) {
      await updateCampaign(editingCampaign.id, {
        name: campaignName,
        channel,
        goal,
        targetAudience,
        productId: selectedProductId || undefined,
        offer,
        tone,
        content: generatedContent,
      });
      toast.success("Campaign updated");
    } else {
      await addCampaign({
        name: campaignName,
        channel,
        goal,
        targetAudience,
        productId: selectedProductId || undefined,
        offer,
        tone,
        content: generatedContent,
        status: "Active",
        reach: Math.floor(800 + Math.random() * 3200),
        revenue: 0,
        progress: 10,
      });
      toast.success("Campaign created & launched! 🚀", {
        description: campaignName,
      });
    }

    setDialogOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Campaign copy copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete campaign "${name}"?`)) {
      await deleteCampaign(id);
      toast.success("Campaign removed");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="AI Marketing & Copywriting"
        title="Marketing Center"
        description="Craft, personalize, and publish promotional campaigns across social, email, and messaging."
        actions={
          <Btn onClick={openCreateModal}>
            <Sparkles className="size-4" /> Create AI Campaign
          </Btn>
        }
      />

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Megaphone className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">No campaigns yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Generate high-converting marketing posts and messages tailored to your products and customer segments.
          </p>
          <Btn onClick={openCreateModal} className="mt-6">
            <Sparkles className="size-4" /> Create Your First Campaign
          </Btn>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const ChannelIcon =
              c.channel === "Instagram"
                ? Instagram
                : c.channel === "WhatsApp"
                ? MessageSquare
                : c.channel === "Email"
                ? Mail
                : Send;

            return (
              <div key={c.id} className="surface lift flex flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ChannelIcon className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm leading-tight">{c.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{c.channel}</p>
                    </div>
                  </div>
                  <Pill
                    tone={
                      c.status === "Active"
                        ? "primary"
                        : c.status === "Scheduled"
                        ? "info"
                        : "neutral"
                    }
                  >
                    {c.status}
                  </Pill>
                </div>

                <div className="my-3 rounded-xl bg-ink/5 p-3 text-xs text-card-foreground">
                  <p className="line-clamp-4 whitespace-pre-line font-mono">{c.content}</p>
                </div>

                <div className="mt-auto space-y-3 pt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Reach: <strong className="text-ink">{c.reach.toLocaleString()}</strong></span>
                    <span>Revenue: <strong className="text-ink">₹{c.revenue.toLocaleString("en-IN")}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(c.content, c.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-input bg-card py-1.5 text-xs font-semibold text-ink hover:bg-muted"
                    >
                      {copiedId === c.id ? <Check className="size-3.5 text-accent-foreground" /> : <Copy className="size-3.5" />}
                      {copiedId === c.id ? "Copied" : "Copy Text"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Campaign Generator Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> AI Marketing Generator
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Campaign Title *</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Weekend Flash Sale"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as CampaignChannel)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Campaign Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Featured Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Store-wide / General</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Special Offer / Incentive</label>
              <input
                type="text"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="e.g. 15% off code BOOST15 or Free Gift with ₹50 order"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* AI Generator Trigger */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-full bg-secondary/15 px-4 py-2 text-xs font-bold text-secondary hover:bg-secondary/25 transition-colors"
              >
                <Sparkles className="size-4" />
                {generating ? "Crafting copy…" : "Generate AI Copy"}
              </button>
            </div>

            {/* Generated Content Box */}
            <div>
              <label className="mb-1 block text-xs font-semibold">Campaign Copy / Message</label>
              <textarea
                rows={6}
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                placeholder="Click 'Generate AI Copy' above or type your customized message here…"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-full border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <Btn type="submit" className="py-2 text-xs">
                Save & Launch Campaign
              </Btn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
