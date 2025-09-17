import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  metaApi,
  shipmentApi,
  type IncotermOption,
  type ModeOption,
  type PackageTypeOption,
} from "@/lib/api";

type GoodsDetailsProps = {
  resetKey: number;
  onResetAll: () => void;
};

type GoodsFormState = {
  mode_shipment: string;
  incoterm_code_text: string;
  is_hazfreight: boolean;
  is_refrigerated: boolean;
  commodity_name: string;
  hs_code_text: string;
  package_type_text: string;
  units: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  weight_kg: string;
  volume_cbm: string;
  ready_date: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  note_text: string;
};

type FormErrors = Record<string, string>;

const DEFAULT_FORM: GoodsFormState = {
  mode_shipment: "",
  incoterm_code_text: "",
  is_hazfreight: false,
  is_refrigerated: false,
  commodity_name: "",
  hs_code_text: "",
  package_type_text: "",
  units: "",
  length_cm: "",
  width_cm: "",
  height_cm: "",
  weight_kg: "",
  volume_cbm: "",
  ready_date: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  note_text: "",
};

const SELECT_PLACEHOLDER = "انتخاب کنید";

const GoodsDetails = ({ resetKey, onResetAll }: GoodsDetailsProps) => {
  const { toast } = useToast();

  const [form, setForm] = useState<GoodsFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [modes, setModes] = useState<ModeOption[]>([]);
  const [packages, setPackages] = useState<PackageTypeOption[]>([]);
  const [incoterms, setIncoterms] = useState<IncotermOption[]>([]);
  const [metaLoading, setMetaLoading] = useState({
    modes: false,
    packages: false,
    incoterms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [volumeManual, setVolumeManual] = useState(false);

  const clearErrors = (field: keyof GoodsFormState) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    setForm(DEFAULT_FORM);
    setErrors({});
    setVolumeManual(false);
  }, [resetKey]);

  useEffect(() => {
    let active = true;

    const loadMeta = async () => {
      setMetaLoading((prev) => ({ ...prev, modes: true, packages: true }));
      try {
        const [modesData, packageData] = await Promise.all([
          metaApi.getModes(),
          metaApi.getPackageTypes(),
        ]);
        if (active) {
          setModes(modesData);
          setPackages(packageData);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          toast({
            title: "خطا در دریافت اطلاعات",
            description: "بارگذاری گزینه‌های فرم با مشکل روبه‌رو شد.",
            variant: "destructive",
          });
        }
      } finally {
        if (active) {
          setMetaLoading((prev) => ({ ...prev, modes: false, packages: false }));
        }
      }
    };

    loadMeta();

    return () => {
      active = false;
    };
  }, [resetKey, toast]);

  useEffect(() => {
    if (!form.mode_shipment) {
      setIncoterms([]);
      return;
    }

    let active = true;
    setMetaLoading((prev) => ({ ...prev, incoterms: true }));

    const fetchIncoterms = async () => {
      try {
        const data = await metaApi.getIncoterms(form.mode_shipment);
        if (active) {
          setIncoterms(data);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          toast({
            title: "خطا در دریافت اینکوترمز",
            description: "امکان بارگذاری لیست اینکوترمز وجود ندارد.",
            variant: "destructive",
          });
        }
      } finally {
        if (active) {
          setMetaLoading((prev) => ({ ...prev, incoterms: false }));
        }
      }
    };

    fetchIncoterms();

    return () => {
      active = false;
    };
  }, [form.mode_shipment, toast]);

  const handleChange = <K extends keyof GoodsFormState>(field: K, value: GoodsFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearErrors(field);
  };

  const handleCheckbox = (field: "is_hazfreight" | "is_refrigerated", checked: boolean | "indeterminate") => {
    handleChange(field, Boolean(checked));
  };

  const numericOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const computedVolume = useMemo(() => {
    if (volumeManual && form.volume_cbm.trim()) {
      return null;
    }
    if (form.volume_cbm.trim()) {
      return null;
    }
    const length = numericOrNull(form.length_cm);
    const width = numericOrNull(form.width_cm);
    const height = numericOrNull(form.height_cm);
    const units = numericOrNull(form.units);
    if (
      length === null ||
      width === null ||
      height === null ||
      units === null ||
      length <= 0 ||
      width <= 0 ||
      height <= 0 ||
      units <= 0
    ) {
      return null;
    }
    const cubic = ((length * width * height) / 1_000_000) * units;
    if (!Number.isFinite(cubic)) return null;
    return Math.round(cubic * 1_000_000) / 1_000_000;
  }, [form.height_cm, form.length_cm, form.units, form.volume_cbm, form.width_cm, volumeManual]);

  const volumeDisplay = useMemo(() => {
    if (volumeManual || form.volume_cbm.trim()) {
      return form.volume_cbm;
    }
    return computedVolume !== null ? String(computedVolume) : "";
  }, [computedVolume, form.volume_cbm, volumeManual]);

  const volumeReadOnly = !volumeManual && !form.volume_cbm.trim() && computedVolume !== null;

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.mode_shipment) {
      newErrors.mode_shipment = "لطفاً نحوه حمل را انتخاب کنید.";
    }

    if (form.incoterm_code_text) {
      const found = incoterms.some(
        (item) => item.code?.toLowerCase() === form.incoterm_code_text.toLowerCase(),
      );
      if (!found) {
        newErrors.incoterm_code_text = "اینکوترمز انتخاب‌شده معتبر نیست.";
      }
    }

    if (!form.commodity_name.trim()) {
      newErrors.commodity_name = "نام کالا الزامی است.";
    } else if (form.commodity_name.trim().length > 120) {
      newErrors.commodity_name = "نام کالا نباید بیش از ۱۲۰ کاراکتر باشد.";
    }

    if (form.hs_code_text && form.hs_code_text.trim().length > 20) {
      newErrors.hs_code_text = "کد HS نباید بیش از ۲۰ کاراکتر باشد.";
    }

    if (!form.package_type_text) {
      newErrors.package_type_text = "نوع بسته‌بندی را انتخاب کنید.";
    } else {
      const found = packages.some(
        (pkg) => pkg.value?.toLowerCase() === form.package_type_text.toLowerCase(),
      );
      if (!found) {
        newErrors.package_type_text = "نوع بسته‌بندی انتخاب‌شده معتبر نیست.";
      }
    }

    const unitsValue = numericOrNull(form.units);
    if (unitsValue === null) {
      newErrors.units = "تعداد را وارد کنید.";
    } else if (!Number.isInteger(unitsValue)) {
      newErrors.units = "تعداد باید عدد صحیح باشد.";
    } else if (unitsValue < 1 || unitsValue > 999999) {
      newErrors.units = "تعداد باید بین ۱ و ۹۹۹۹۹۹ باشد.";
    }

    const dims = [form.length_cm, form.width_cm, form.height_cm];
    const anyDim = dims.some((value) => value.trim() !== "");
    const allDim = dims.every((value) => value.trim() !== "");
    if (anyDim && !allDim) {
      newErrors.length_cm = "در صورت وارد کردن ابعاد، طول/عرض/ارتفاع را کامل کنید.";
      newErrors.width_cm = newErrors.length_cm;
      newErrors.height_cm = newErrors.length_cm;
    }

    const validateDimension = (field: "length_cm" | "width_cm" | "height_cm") => {
      const value = form[field];
      if (!value.trim()) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        newErrors[field] = "مقدار باید عددی باشد.";
      } else if (parsed < 0 || parsed > 100000) {
        newErrors[field] = "مقدار باید بین ۰ و ۱۰۰۰۰۰ باشد.";
      }
    };

    validateDimension("length_cm");
    validateDimension("width_cm");
    validateDimension("height_cm");

    if (form.weight_kg.trim()) {
      const weight = Number(form.weight_kg);
      if (!Number.isFinite(weight)) {
        newErrors.weight_kg = "وزن باید عددی باشد.";
      } else if (weight < 0 || weight > 100000) {
        newErrors.weight_kg = "وزن باید بین ۰ و ۱۰۰۰۰۰ باشد.";
      }
    }

    const volumeValue = volumeManual || form.volume_cbm.trim() ? Number(volumeDisplay) : computedVolume;
    if (volumeValue != null) {
      if (!Number.isFinite(volumeValue)) {
        newErrors.volume_cbm = "حجم باید عددی معتبر باشد.";
      } else if (volumeValue < 0 || volumeValue > 100000) {
        newErrors.volume_cbm = "حجم باید بین ۰ و ۱۰۰۰۰۰ باشد.";
      }
    }

    if (form.ready_date) {
      const today = new Date();
      const [year, month, day] = form.ready_date.split("-").map(Number);
      if (!year || !month || !day) {
        newErrors.ready_date = "تاریخ واردشده معتبر نیست.";
      } else {
        const readyDate = new Date(year, month - 1, day);
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (readyDate < todayMidnight) {
          newErrors.ready_date = "تاریخ باید برابر یا بعد از امروز باشد.";
        }
      }
    }

    if (!form.contact_name.trim()) {
      newErrors.contact_name = "نام مخاطب الزامی است.";
    } else if (form.contact_name.trim().length > 80) {
      newErrors.contact_name = "نام مخاطب نباید بیش از ۸۰ کاراکتر باشد.";
    }

    if (form.contact_phone.trim()) {
      const pattern = /^09\d{9}$/;
      if (!pattern.test(form.contact_phone.trim())) {
        newErrors.contact_phone = "شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد.";
      }
    }

    if (form.contact_email.trim()) {
      const emailPattern = /^\S+@\S+\.\S+$/;
      if (!emailPattern.test(form.contact_email.trim())) {
        newErrors.contact_email = "ایمیل واردشده معتبر نیست.";
      }
    }

    if (form.note_text.length > 140) {
      newErrors.note_text = "حداکثر ۱۴۰ کاراکتر مجاز است.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!validateForm()) {
      toast({
        title: "خطا در اعتبارسنجی",
        description: "لطفاً خطاهای فرم را برطرف کنید.",
        variant: "destructive",
      });
      return;
    }

    const resolvedVolume = (() => {
      if (volumeManual || form.volume_cbm.trim()) {
        const numeric = Number(volumeDisplay);
        return Number.isFinite(numeric) ? numeric : undefined;
      }
      if (computedVolume !== null) {
        return computedVolume;
      }
      return undefined;
    })();

    const payload = {
      mode_shipment: form.mode_shipment,
      incoterm_code_text: form.incoterm_code_text || undefined,
      is_hazfreight: form.is_hazfreight,
      is_refrigerated: form.is_refrigerated,
      commodity_name: form.commodity_name.trim(),
      hs_code_text: form.hs_code_text.trim() || undefined,
      package_type_text: form.package_type_text,
      units: Number(form.units),
      length_cm: numericOrNull(form.length_cm) ?? undefined,
      width_cm: numericOrNull(form.width_cm) ?? undefined,
      height_cm: numericOrNull(form.height_cm) ?? undefined,
      weight_kg: numericOrNull(form.weight_kg) ?? undefined,
      volume_cbm: resolvedVolume ?? undefined,
      ready_date: form.ready_date || undefined,
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.trim() || undefined,
      contact_email: form.contact_email.trim() || undefined,
      note_text: form.note_text || undefined,
    };

    setSubmitting(true);
    try {
      const result = await shipmentApi.validateDraft(payload);
      setVolumeManual(true);
      setForm((prev) => ({
        ...prev,
        volume_cbm: result.volume_cbm.toString(),
      }));
      setErrors({});
      toast({
        title: "اعتبارسنجی موفق",
        description: "اطلاعات معتبر است.",
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && (error as Error & { payload?: unknown }).payload) {
        const payloadError = (error as Error & { payload?: unknown }).payload as {
          error?: string;
          details?: { fields?: Record<string, string> };
          request_id?: string;
        };
        if (payloadError?.details?.fields) {
          setErrors(payloadError.details.fields);
        }
        toast({
          title: "خطا در ارسال", 
          description:
            payloadError?.error || "اعتبارسنجی با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا در ارسال",
          description: "امکان برقراری ارتباط با سرور وجود ندارد.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modePlaceholder = metaLoading.modes ? (
    <span className="flex items-center gap-2 text-xs">
      <Loader2 className="h-3 w-3 animate-spin" /> در حال بارگذاری…
    </span>
  ) : (
    SELECT_PLACEHOLDER
  );

  const packagePlaceholder = metaLoading.packages ? (
    <span className="flex items-center gap-2 text-xs">
      <Loader2 className="h-3 w-3 animate-spin" /> در حال بارگذاری…
    </span>
  ) : (
    SELECT_PLACEHOLDER
  );

  const incotermPlaceholder = metaLoading.incoterms ? (
    <span className="flex items-center gap-2 text-xs">
      <Loader2 className="h-3 w-3 animate-spin" /> در حال بارگذاری…
    </span>
  ) : (
    "(اختیاری)"
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>جزئیات محموله</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mode_shipment">نحوه حمل *</Label>
              <Select
                value={form.mode_shipment}
                onValueChange={(value) => {
                  handleChange("mode_shipment", value);
                  handleChange("incoterm_code_text", "");
                }}
                disabled={metaLoading.modes}
              >
                <SelectTrigger id="mode_shipment">
                  <SelectValue placeholder={modePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label_fa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mode_shipment && (
                <p className="text-xs text-destructive mt-2">{errors.mode_shipment}</p>
              )}
            </div>
            <div>
              <Label htmlFor="incoterm_code_text">شرایط تحویل (اینکوترمز)</Label>
              <Select
                value={form.incoterm_code_text}
                onValueChange={(value) => handleChange("incoterm_code_text", value)}
                disabled={!form.mode_shipment || metaLoading.incoterms}
              >
                <SelectTrigger id="incoterm_code_text">
                  <SelectValue placeholder={incotermPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون انتخاب</SelectItem>
                  {incoterms.map((item) => (
                    <SelectItem key={item.id} value={item.code}>
                      {item.code} ـ {item.name_fa ?? item.desc_fa ?? item.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.incoterm_code_text && (
                <p className="text-xs text-destructive mt-2">{errors.incoterm_code_text}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_hazfreight}
                onCheckedChange={(checked) => handleCheckbox("is_hazfreight", checked)}
              />
              کالای خطرناک
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_refrigerated}
                onCheckedChange={(checked) => handleCheckbox("is_refrigerated", checked)}
              />
              یخچالی
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commodity_name">نام کالا *</Label>
              <Input
                id="commodity_name"
                value={form.commodity_name}
                onChange={(event) => handleChange("commodity_name", event.target.value)}
                placeholder="مثال: قطعات صنعتی"
              />
              {errors.commodity_name && (
                <p className="text-xs text-destructive mt-2">{errors.commodity_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="hs_code_text">کد HS</Label>
              <Input
                id="hs_code_text"
                value={form.hs_code_text}
                onChange={(event) => handleChange("hs_code_text", event.target.value)}
                placeholder="اختیاری"
                className="ltr-input"
              />
              {errors.hs_code_text && (
                <p className="text-xs text-destructive mt-2">{errors.hs_code_text}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package_type_text">نوع بسته‌بندی *</Label>
              <Select
                value={form.package_type_text}
                onValueChange={(value) => handleChange("package_type_text", value)}
                disabled={metaLoading.packages}
              >
                <SelectTrigger id="package_type_text">
                  <SelectValue placeholder={packagePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label_fa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.package_type_text && (
                <p className="text-xs text-destructive mt-2">{errors.package_type_text}</p>
              )}
            </div>
            <div>
              <Label htmlFor="units">تعداد *</Label>
              <Input
                id="units"
                type="number"
                min={1}
                value={form.units}
                onChange={(event) => handleChange("units", event.target.value)}
              />
              {errors.units && <p className="text-xs text-destructive mt-2">{errors.units}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length_cm">طول (سانتی‌متر)</Label>
              <Input
                id="length_cm"
                type="number"
                min={0}
                value={form.length_cm}
                onChange={(event) => handleChange("length_cm", event.target.value)}
              />
              {errors.length_cm && (
                <p className="text-xs text-destructive mt-2">{errors.length_cm}</p>
              )}
            </div>
            <div>
              <Label htmlFor="width_cm">عرض (سانتی‌متر)</Label>
              <Input
                id="width_cm"
                type="number"
                min={0}
                value={form.width_cm}
                onChange={(event) => handleChange("width_cm", event.target.value)}
              />
              {errors.width_cm && (
                <p className="text-xs text-destructive mt-2">{errors.width_cm}</p>
              )}
            </div>
            <div>
              <Label htmlFor="height_cm">ارتفاع (سانتی‌متر)</Label>
              <Input
                id="height_cm"
                type="number"
                min={0}
                value={form.height_cm}
                onChange={(event) => handleChange("height_cm", event.target.value)}
              />
              {errors.height_cm && (
                <p className="text-xs text-destructive mt-2">{errors.height_cm}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight_kg">وزن (کیلوگرم)</Label>
              <Input
                id="weight_kg"
                type="number"
                min={0}
                value={form.weight_kg}
                onChange={(event) => handleChange("weight_kg", event.target.value)}
              />
              {errors.weight_kg && (
                <p className="text-xs text-destructive mt-2">{errors.weight_kg}</p>
              )}
            </div>
            <div>
              <Label htmlFor="volume_cbm">حجم (متر مکعب)</Label>
              <Input
                id="volume_cbm"
                type="number"
                min={0}
                value={volumeDisplay}
                readOnly={volumeReadOnly}
                onChange={(event) => {
                  setVolumeManual(Boolean(event.target.value.trim()));
                  handleChange("volume_cbm", event.target.value);
                }}
              />
              {volumeReadOnly && (
                <p className="text-xs text-muted-foreground mt-2">
                  حجم بر اساس ابعاد و تعداد محاسبه شده است.
                </p>
              )}
              {errors.volume_cbm && (
                <p className="text-xs text-destructive mt-2">{errors.volume_cbm}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="ready_date">تاریخ آماده‌بار</Label>
            <Input
              id="ready_date"
              type="date"
              value={form.ready_date}
              onChange={(event) => handleChange("ready_date", event.target.value)}
            />
            {errors.ready_date && (
              <p className="text-xs text-destructive mt-2">{errors.ready_date}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">نام مخاطب *</Label>
              <Input
                id="contact_name"
                value={form.contact_name}
                onChange={(event) => handleChange("contact_name", event.target.value)}
              />
              {errors.contact_name && (
                <p className="text-xs text-destructive mt-2">{errors.contact_name}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">تلفن همراه</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(event) => handleChange("contact_phone", event.target.value)}
                  placeholder="09123456789"
                  className="ltr-input"
                />
                {errors.contact_phone && (
                  <p className="text-xs text-destructive mt-2">{errors.contact_phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contact_email">ایمیل</Label>
                <Input
                  id="contact_email"
                  value={form.contact_email}
                  onChange={(event) => handleChange("contact_email", event.target.value)}
                  placeholder="sample@mail.com"
                  className="ltr-input"
                />
                {errors.contact_email && (
                  <p className="text-xs text-destructive mt-2">{errors.contact_email}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="note_text">یادداشت</Label>
            <Textarea
              id="note_text"
              value={form.note_text}
              onChange={(event) => handleChange("note_text", event.target.value.slice(0, 140))}
              rows={3}
              placeholder="توضیحات اضافی در مورد محموله"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>حداکثر ۱۴۰ کاراکتر</span>
              <span className="persian-nums">{form.note_text.length}/140</span>
            </div>
            {errors.note_text && (
              <p className="text-xs text-destructive mt-2">{errors.note_text}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={submitting} size="lg">
              {submitting ? "در حال ارسال…" : "ارسال درخواست"}
            </Button>
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground flex items-center justify-between gap-3">
              <span>در صورت نیاز می‌توانید تمام اطلاعات را ریست کرده و از ابتدا وارد کنید.</span>
              <button type="button" className="text-xs underline" onClick={onResetAll}>
                ریست مبدأ/مقصد و جزئیات
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoodsDetails;
