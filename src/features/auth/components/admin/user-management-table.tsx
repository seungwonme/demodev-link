"use client";

import { useState } from "react";
import { Profile } from "@/features/auth/types/profile";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Check, X, User, ShieldCheck } from "lucide-react";
import { updateUserStatus, updateUserRole } from "@/features/auth/actions/user";

interface UserManagementTableProps {
  users: Profile[];
  currentUserId: string;
}

export default function UserManagementTable({
  users,
  currentUserId,
}: UserManagementTableProps) {
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (userId: string) => {
    setLoadingUsers((prev) => new Set(prev).add(userId));
    try {
      await updateUserStatus(userId, "approved");
    } finally {
      setLoadingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) return;

    setLoadingUsers((prev) => new Set(prev).add(userId));
    try {
      await updateUserStatus(userId, "rejected", rejectionReason);
      setRejectionReason("");
    } finally {
      setLoadingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin",
  ) => {
    setLoadingUsers((prev) => new Set(prev).add(userId));
    try {
      await updateUserRole(userId, newRole);
    } finally {
      setLoadingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        사용자가 없습니다.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>권한</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isLoading = loadingUsers.has(user.id);
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow
                  key={user.id}
                  className={isLoading ? "opacity-50" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.email} {isCurrentUser && "(나)"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "approved"
                          ? "default"
                          : user.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {user.status === "approved"
                        ? "승인됨"
                        : user.status === "pending"
                        ? "대기중"
                        : "거절됨"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">
                        {user.role === "admin" ? "관리자" : "사용자"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(user.id)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => setRejectionReason("")}
                              >
                                <X className="h-4 w-4 mr-1" />
                                거절
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  사용자 가입 거절
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 사용자의 가입을 거절하시겠습니까? 거절
                                  사유를 입력해주세요.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="rejection-reason">
                                    거절 사유
                                  </Label>
                                  <Input
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(e) =>
                                      setRejectionReason(e.target.value)
                                    }
                                    placeholder="거절 사유를 입력하세요"
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setRejectionReason("");
                                  }}
                                >
                                  취소
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(user.id)}
                                  disabled={!rejectionReason.trim()}
                                >
                                  거절
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {user.status === "approved" && !isCurrentUser && (
                        <AlertDialog>
                          <Select
                            value={user.role || "user"}
                            onValueChange={(value) =>
                              handleRoleChange(
                                user.id,
                                value as "user" | "admin",
                              )
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">사용자</SelectItem>
                              <SelectItem value="admin">관리자</SelectItem>
                            </SelectContent>
                          </Select>
                        </AlertDialog>
                      )}

                      {user.status === "rejected" && user.rejection_reason && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground cursor-help">
                              사유: {user.rejection_reason.slice(0, 20)}...
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{user.rejection_reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
