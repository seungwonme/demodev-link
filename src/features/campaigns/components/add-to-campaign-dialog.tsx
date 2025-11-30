"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getCampaigns, addLinkToCampaign } from "../actions/campaign-actions";
import { CampaignStatusBadge } from "./campaign-status-badge";
import type { CampaignWithStats, CampaignStatus } from "../types/campaign";

interface AddToCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkId: string;
  onSuccess?: () => void;
}

export function AddToCampaignDialog({
  open,
  onOpenChange,
  linkId,
  onSuccess,
}: AddToCampaignDialogProps) {
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const result = await getCampaigns();
      if (result.success && result.data) {
        // active와 paused 상태의 캠페인만 표시
        const activeCampaigns = result.data.filter(
          (c) => c.status === "active" || c.status === "paused"
        );
        setCampaigns(activeCampaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      toast.error("캠페인 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCampaignId) {
      toast.error("캠페인을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addLinkToCampaign(selectedCampaignId, linkId);

      if (result.success) {
        toast.success("캠페인에 링크가 추가되었습니다.");
        setSelectedCampaignId("");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "링크 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Add to campaign error:", error);
      toast.error("링크 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>캠페인에 추가</DialogTitle>
          <DialogDescription>
            이 링크를 추가할 캠페인을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>사용 가능한 캠페인이 없습니다.</p>
              <p className="text-sm mt-2">먼저 캠페인을 생성해주세요.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="campaign-select">캠페인 선택</Label>
              <Select
                value={selectedCampaignId}
                onValueChange={setSelectedCampaignId}
              >
                <SelectTrigger id="campaign-select">
                  <SelectValue placeholder="캠페인을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      <div className="flex items-center gap-2">
                        <span>{campaign.name}</span>
                        <CampaignStatusBadge
                          status={campaign.status as CampaignStatus}
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isSubmitting || isLoading || campaigns.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                추가 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                추가
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
