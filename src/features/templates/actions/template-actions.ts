"use server";

import { revalidatePath } from "next/cache";
import { TemplateService } from "../services/template.service";
import type { CreateTemplateDTO, UpdateTemplateDTO } from "../types/template";

export async function createTemplate(data: CreateTemplateDTO) {
  try {
    const template = await TemplateService.createTemplate(data);
    revalidatePath("/admin/templates");
    return { success: true, data: template };
  } catch (error) {
    console.error("Create template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "템플릿 생성에 실패했습니다.",
    };
  }
}

export async function getTemplate(id: string) {
  try {
    const template = await TemplateService.getTemplateById(id);
    return { success: true, data: template };
  } catch (error) {
    console.error("Get template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "템플릿 조회에 실패했습니다.",
    };
  }
}

export async function getTemplates() {
  try {
    const templates = await TemplateService.getTemplatesByUser();
    return { success: true, data: templates };
  } catch (error) {
    console.error("Get templates error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "템플릿 목록 조회에 실패했습니다.",
    };
  }
}

export async function updateTemplate(id: string, data: UpdateTemplateDTO) {
  try {
    const template = await TemplateService.updateTemplate(id, data);
    revalidatePath("/admin/templates");
    revalidatePath(`/admin/templates/${id}`);
    return { success: true, data: template };
  } catch (error) {
    console.error("Update template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "템플릿 수정에 실패했습니다.",
    };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await TemplateService.deleteTemplate(id);
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error) {
    console.error("Delete template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "템플릿 삭제에 실패했습니다.",
    };
  }
}
