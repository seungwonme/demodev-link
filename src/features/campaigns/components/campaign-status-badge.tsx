import { Badge } from "@/shared/components/ui/badge";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  type CampaignStatus,
} from "../types/campaign";

interface CampaignStatusBadgeProps {
  status: CampaignStatus | null;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const effectiveStatus = status || "active";

  return (
    <Badge
      variant="secondary"
      className={CAMPAIGN_STATUS_COLORS[effectiveStatus]}
    >
      {CAMPAIGN_STATUS_LABELS[effectiveStatus]}
    </Badge>
  );
}
