"use client";

import { useState } from "react";
import { productService } from "../services/product.service";

export function useProductForm(initialData: any = {}) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const submit = async (id?: number) => {
    setSaving(true);
    if (id) {
      await productService.update(id, form);
    } else {
      await productService.create(form);
    }
    setSaving(false);
  };

  return { form, updateField, submit, saving };
}
