import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIncoterms, usePackageTypes, useShipmentModes } from "@/hooks/useCatalog";
import {
  shipmentApi,
  type SubmitShipmentRequestPayload,
  type SubmitShipmentResponse,
} from "@/lib/api";
import type { GeoValue } from "./CascadingSelect";

type GoodsDetailsProps = {
  origin: GeoValue;
  destination: GeoValue;
  resetKey: number;
  onResetAll: () => void;
};

type GoodsFormState = {
  modeId: string;
  incotermCode: string;
  packageId: string;
  isHazardous: boolean;
  isRefrigerated: boolean;
  commodityName: string;
  hsCode: string;
  units: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  volume: string;
  readyDate: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  note: string;
};

type FormErrors = Partial<Record<keyof GoodsFormState, string>> & {
  general?: string;
};

const DEFAULT_FORM: GoodsFormState = {
  modeId: "",
  incotermCode: "",
  packageId: "",
  isHazardous: false,
  isRefrigerated: false,
  commodityName: "",
  hsCode: "",
  units: "",
  length: "",
  width: "",
  height: "",
  weight: "",
  volume: "",
  readyDate: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  note: "",
};

const PHONE_RE = /^0\d{10}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const GoodsDetails = ({ origin, destination, resetKey, onResetAll }: GoodsDetailsProps) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<GoodsFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SubmitShipmentResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastModeRef = useRef<string>("");

  const modes = useShipmentModes();
  const packages = usePackageTypes();
  const incoterms = useIncoterms();

  useEffect(() => {
    setForm(DEFAULT_FORM);
    setErrors({});
    setSuccess(null);
    setSubmitError(null);
  }, [resetKey]);

  useEffect(() => {
    if (lastModeRef.current && lastModeRef.current !== form.modeId) {
      setForm((prev) =>
        prev.incotermCode ? { ...prev, incotermCode: "" } : prev,
      );
    }
    if (!form.modeId && form.incotermCode) {
      setForm((prev) => ({ ...prev, incotermCode: "" }));
    }
    lastModeRef.current = form.modeId;
  }, [form.incotermCode, form.modeId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const computedVolume = useMemo(() => {
    if (form.volume.trim()) return null;
    const units = Number(form.units);
    const length = Number(form.length);
    const width = Number(form.width);
    const height = Number(form.height);
    if (
      Number.isFinite(units) &&
      Number.isFinite(length) &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      units > 0 &&
      length > 0 &&
      width > 0 &&
      height > 0
    ) {
      const volume = ((length * width * height) / 1_000_000) * units;
      return Number.isFinite(volume) ? Number(volume.toFixed(3)) : null;
    }
    return null;
  }, [form.height, form.length, form.units, form.volume, form.width]);

  const isGeoComplete = Boolean(
    origin.province_id &&
      origin.county_id &&
      origin.city_id &&
      destination.province_id &&
      destination.county_id &&
      destination.city_id,
  );

  const requiredFilled = Boolean(
    form.modeId &&
      form.packageId &&
      form.units &&
      form.commodityName.trim() &&
      form.weight &&
      form.contactName.trim(),
  );

  const canSubmit = isGeoComplete && requiredFilled && !submitting;

  const updateField = <K extends keyof GoodsFormState>(field: K, value: GoodsFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const numericOrUndefined = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);

    const nextErrors: FormErrors = {};

    const modeId = Number(form.modeId);
    if (!Number.isInteger(modeId) || modeId <= 0) {
      nextErrors.modeId = "نحوه حمل را انتخاب کنید.";
    }

    const packageId = Number(form.packageId);
    if (!Number.isInteger(packageId) || packageId <= 0) {
      nextErrors.packageId = "نوع بسته‌بندی را انتخاب کنید.";
    }

    const units = Number(form.units);
    if (!Number.isInteger(units) || units <= 0) {
      nextErrors.units = "تعداد باید عدد صحیح مثبت باشد.";
    }

    const weight = Number(form.weight);
    if (!Number.isFinite(weight) || weight < 0) {
      nextErrors.weight = "وزن معتبر وارد کنید.";
    }

    const length = numericOrUndefined(form.length);
    const width = numericOrUndefined(form.width);
    const height = numericOrUndefined(form.height);
    const dims = [length, width, height].filter((value) => value !== undefined);
    if (dims.length > 0 && dims.length < 3) {
      nextErrors.length = "برای ثبت ابعاد، هر سه مقدار لازم است.";
      nextErrors.width = "برای ثبت ابعاد، هر سه مقدار لازم است.";
      nextErrors.height = "برای ثبت ابعاد، هر سه مقدار لازم است.";
    }

    const volumeManual = form.volume.trim();
    const volumeValue = volumeManual ? Number(volumeManual) : computedVolume ?? undefined;
    if (volumeManual) {
      if (!Number.isFinite(volumeValue) || volumeValue < 0) {
        nextErrors.volume = "حجم معتبر وارد کنید.";
      }
    }

    const commodityName = form.commodityName.trim();
    if (!commodityName) {
      nextErrors.commodityName = "نام کالا الزامی است.";
    } else if (commodityName.length > 120) {
      nextErrors.commodityName = "نام کالا نباید بیش از ۱۲۰ کاراکتر باشد.";
    }

    const hsCode = form.hsCode.trim();
    if (hsCode && hsCode.length > 20) {
      nextErrors.hsCode = "کد HS نباید بیش از ۲۰ کاراکتر باشد.";
    }

    const contactName = form.contactName.trim();
    if (!contactName) {
      nextErrors.contactName = "نام مخاطب الزامی است.";
    } else if (contactName.length > 80) {
      nextErrors.contactName = "نام مخاطب نباید بیش از ۸۰ کاراکتر باشد.";
    }

    const contactPhone = form.contactPhone.trim();
    if (contactPhone && !PHONE_RE.test(contactPhone)) {
      nextErrors.contactPhone = "شماره تماس باید با ۰ شروع شود و ۱۱ رقم باشد.";
    }

    const contactEmail = form.contactEmail.trim();
    if (contactEmail && !EMAIL_RE.test(contactEmail)) {
      nextErrors.contactEmail = "ایمیل واردشده معتبر نیست.";
    }

    const note = form.note.trim();
    if (note.length > 140) {
      nextErrors.note = "یادداشت نباید بیش از ۱۴۰ کاراکتر باشد.";
    }

    const readyDate = form.readyDate.trim();
    if (readyDate) {
      const today = new Date();
      const selected = new Date(`${readyDate}T00:00:00`);
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime())) {
        nextErrors.readyDate = "تاریخ معتبر نیست.";
      } else if (selected < today) {
        nextErrors.readyDate = "تاریخ نمی‌تواند قبل از امروز باشد.";
      }
    }

    if (!origin.province_id || !origin.county_id || !origin.city_id) {
      nextErrors.general = "مبدأ را کامل انتخاب کنید.";
    }
    if (!destination.province_id || !destination.county_id || !destination.city_id) {
      nextErrors.general = nextErrors.general
        ? `${nextErrors.general} مقصد را نیز کامل انتخاب کنید.`
        : "مقصد را کامل انتخاب کنید.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: SubmitShipmentRequestPayload = {
      origin_province_id: origin.province_id!,
      origin_county_id: origin.county_id!,
      origin_city_id: origin.city_id!,
      dest_province_id: destination.province_id!,
      dest_county_id: destination.county_id!,
      dest_city_id: destination.city_id!,
      mode_shipment_mode: modeId,
      package_type: packageId,
      units,
      commodity_name: commodityName,
      weight_kg: weight,
      contact_name: contactName,
      is_hazfreight: form.isHazardous,
      is_refrigerated: form.isRefrigerated,
    };

    if (form.incotermCode.trim()) payload.incoterm_code = form.incotermCode.trim();
    if (hsCode) payload.hs_code = hsCode;
    if (length !== undefined) payload.length_cm = length;
    if (width !== undefined) payload.width_cm = width;
    if (height !== undefined) payload.height_cm = height;
    if (volumeValue !== undefined) payload.volume_m3 = Number(volumeValue.toFixed(3));
    if (readyDate) payload.ready_date = readyDate;
    if (contactPhone) payload.contact_phone = contactPhone;
    if (contactEmail) payload.contact_email = contactEmail;
    if (note) payload.note_text = note;

    setSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const response = await shipmentApi.submit(payload);
      setSuccess(response);
      setSubmitError(null);
      toast({
        title: "درخواست با موفقیت ثبت شد.",
        description: `شماره پیگیری ${response.shipment_request_id} با SLA ${
          response.sla_hours ?? 0
        } ساعت ثبت شد.`,
      });
      setForm(DEFAULT_FORM);
    } catch (error) {
      const err = error as Error & {
        status?: number;
        payload?: unknown;
        raw?: string | null;
      };

      let message = "ارسال درخواست با خطا مواجه شد.";
      let requestId: string | undefined;

      if (err.payload && typeof err.payload === "object" && err.payload !== null) {
        const payloadObj = err.payload as {
          error?: string;
          details?: { fields?: Record<string, string> };
          request_id?: string;
        };
        if (typeof payloadObj.error === "string" && payloadObj.error.trim()) {
          message = payloadObj.error.trim();
        }
        if (typeof payloadObj.request_id === "string" && payloadObj.request_id) {
          requestId = payloadObj.request_id;
        }
        const details = payloadObj.details;
        if (details?.fields) {
          const serverErrors: FormErrors = {};
          Object.entries(details.fields).forEach(([key, value]) => {
            if (key === "mode_shipment_mode") serverErrors.modeId = value;
            else if (key === "package_type") serverErrors.packageId = value;
            else if (key === "units") serverErrors.units = value;
            else if (key === "commodity_name") serverErrors.commodityName = value;
            else if (key === "hs_code") serverErrors.hsCode = value;
            else if (key === "length_cm") serverErrors.length = value;
            else if (key === "width_cm") serverErrors.width = value;
            else if (key === "height_cm") serverErrors.height = value;
            else if (key === "weight_kg") serverErrors.weight = value;
            else if (key === "volume_m3") serverErrors.volume = value;
            else if (key === "ready_date") serverErrors.readyDate = value;
            else if (key === "contact_name") serverErrors.contactName = value;
            else if (key === "contact_phone") serverErrors.contactPhone = value;
            else if (key === "contact_email") serverErrors.contactEmail = value;
            else if (key === "note_text") serverErrors.note = value;
            else if (key === "incoterm_code") serverErrors.incotermCode = value;
            else serverErrors.general = value;
          });
          setErrors(serverErrors);
        }
      } else if (typeof err.payload === "string" && err.payload.trim()) {
        message = err.payload.trim();
      } else if (typeof err.raw === "string" && err.raw.trim()) {
        message = err.raw.trim();
      }

      const composedMessage = requestId
        ? `${message} (کد پیگیری: ${requestId})`
        : message;
      setSubmitError(composedMessage);

      toast({
        title: "ثبت درخواست ناموفق بود.",
        description: composedMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const volumeDisplay = computedVolume ?? form.volume;

  return (
    <Card ref={containerRef} className="shadow-card">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-2xl font-bold">جزئیات محموله</CardTitle>
        <Button variant="outline" size="sm" onClick={onResetAll} type="button">
          ریست همه انتخاب‌ها
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errors.general && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
              درخواست شماره {success.shipment_request_id} با مهلت پاسخ‌گویی {success.sla_hours ?? 0} ساعته ثبت شد.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mode">نحوه حمل *</Label>
              <Select
                value={form.modeId}
                onValueChange={(value) => updateField("modeId", value)}
                disabled={modes.loading}
              >
                <SelectTrigger id="mode">
                  <SelectValue placeholder={modes.loading ? "در حال بارگذاری..." : "انتخاب کنید"} />
                </SelectTrigger>
              <SelectContent>
                {modes.items.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name_fa ?? item.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modes.loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {modes.error && <p className="text-xs text-destructive">{modes.error}</p>}
            {errors.modeId && <p className="text-xs text-destructive">{errors.modeId}</p>}
          </div>

            <div className="space-y-2">
              <Label htmlFor="incoterm">شرایط تحویل (اینکوترمز)</Label>
              <Select
                value={form.incotermCode}
                onValueChange={(value) => updateField("incotermCode", value)}
                disabled={incoterms.loading || !form.modeId}
              >
                <SelectTrigger id="incoterm">
                  <SelectValue
                    placeholder={
                      !form.modeId
                        ? "ابتدا نحوه حمل را انتخاب کنید"
                        : incoterms.loading
                          ? "در حال بارگذاری..."
                          : "انتخاب کنید"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {incoterms.items.map((item) => (
                    <SelectItem key={item.id} value={item.code}>
                      {item.name_fa ?? item.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.incotermCode && <p className="text-xs text-destructive">{errors.incotermCode}</p>}
              {incoterms.error && <p className="text-xs text-destructive">{incoterms.error}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="package">نوع بسته‌بندی *</Label>
              <Select
                value={form.packageId}
                onValueChange={(value) => updateField("packageId", value)}
                disabled={packages.loading}
              >
                <SelectTrigger id="package">
                  <SelectValue placeholder={packages.loading ? "در حال بارگذاری..." : "انتخاب کنید"} />
                </SelectTrigger>
              <SelectContent>
                {packages.items.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name_fa ?? item.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {packages.loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {packages.error && <p className="text-xs text-destructive">{packages.error}</p>}
            {errors.packageId && <p className="text-xs text-destructive">{errors.packageId}</p>}
          </div>

            <div className="space-y-2">
              <Label htmlFor="units">تعداد *</Label>
              <Input
                id="units"
                inputMode="numeric"
                value={form.units}
                onChange={(event) => updateField("units", event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="مثلاً 10"
              />
              {errors.units && <p className="text-xs text-destructive">{errors.units}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="commodity">نام کالا *</Label>
              <Input
                id="commodity"
                value={form.commodityName}
                maxLength={120}
                onChange={(event) => updateField("commodityName", event.target.value)}
                placeholder="مثلاً قطعات یدکی خودرو"
              />
              {errors.commodityName && <p className="text-xs text-destructive">{errors.commodityName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hs">HS کد</Label>
              <Input
                id="hs"
                value={form.hsCode}
                maxLength={20}
                onChange={(event) => updateField("hsCode", event.target.value)}
                placeholder="مثلاً 8708.99.00"
              />
              {errors.hsCode && <p className="text-xs text-destructive">{errors.hsCode}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="length">طول (سانتی‌متر)</Label>
              <Input
                id="length"
                value={form.length}
                inputMode="decimal"
                onChange={(event) => updateField("length", event.target.value)}
              />
              {errors.length && <p className="text-xs text-destructive">{errors.length}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">عرض (سانتی‌متر)</Label>
              <Input
                id="width"
                value={form.width}
                inputMode="decimal"
                onChange={(event) => updateField("width", event.target.value)}
              />
              {errors.width && <p className="text-xs text-destructive">{errors.width}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">ارتفاع (سانتی‌متر)</Label>
              <Input
                id="height"
                value={form.height}
                inputMode="decimal"
                onChange={(event) => updateField("height", event.target.value)}
              />
              {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">حجم (مترمکعب)</Label>
              <Input
                id="volume"
                value={volumeDisplay === "" ? "" : String(volumeDisplay)}
                readOnly={computedVolume !== null}
                inputMode="decimal"
                onChange={(event) => updateField("volume", event.target.value)}
                placeholder={computedVolume !== null ? String(computedVolume) : "مثلاً 0.48"}
              />
              {computedVolume !== null && (
                <p className="text-xs text-muted-foreground">حجم بر اساس ابعاد و تعداد محاسبه شده است.</p>
              )}
              {errors.volume && <p className="text-xs text-destructive">{errors.volume}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">وزن (کیلوگرم) *</Label>
              <Input
                id="weight"
                value={form.weight}
                inputMode="decimal"
                onChange={(event) => updateField("weight", event.target.value)}
                placeholder="مثلاً 200.5"
              />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="readyDate">تاریخ آماده‌بار</Label>
              <Input
                id="readyDate"
                type="date"
                value={form.readyDate}
                onChange={(event) => updateField("readyDate", event.target.value)}
              />
              {errors.readyDate && <p className="text-xs text-destructive">{errors.readyDate}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">نام مخاطب *</Label>
              <Input
                id="contactName"
                value={form.contactName}
                maxLength={80}
                onChange={(event) => updateField("contactName", event.target.value)}
                placeholder="نام و نام‌خانوادگی"
              />
              {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">شماره تماس</Label>
              <Input
                id="contactPhone"
                value={form.contactPhone}
                onChange={(event) => updateField("contactPhone", event.target.value)}
                placeholder="09123456789"
              />
              {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">ایمیل</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
                placeholder="user@example.com"
              />
              {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">یادداشت</Label>
              <Textarea
                id="note"
                value={form.note}
                maxLength={140}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="توضیح کوتاه"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>حداکثر ۱۴۰ کاراکتر</span>
                <span>{form.note.length}/140</span>
              </div>
              {errors.note && <p className="text-xs text-destructive">{errors.note}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.isHazardous}
                onCheckedChange={(checked) => updateField("isHazardous", Boolean(checked))}
              />
              کالای خطرناک است
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.isRefrigerated}
                onCheckedChange={(checked) => updateField("isRefrigerated", Boolean(checked))}
              />
              نیاز به یخچال دارد
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            برای ارسال درخواست لازم است مبدأ، مقصد و فیلدهای الزامی فرم را تکمیل کنید.
          </p>
          <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
            {submitError && (
              <span className="text-sm text-destructive text-right">{submitError}</span>
            )}
            <Button type="submit" disabled={!canSubmit}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ارسال درخواست
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GoodsDetails;
