import { useState } from "react";
import Layout from "@/components/Layout";
import ProcessStepper from "@/components/ProcessStepper";
import { Card, CardContent } from "@/components/ui/card";
import { CascadingSelect, GeoValue } from "@/components/CascadingSelect";
import { requestApi, type ShipmentRequestResponse } from "@/lib/api";

const LandingPage = () => {
  const [originData, setOriginData] = useState<GeoValue>({});
  const [destinationData, setDestinationData] = useState<GeoValue>({});
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ShipmentRequestResponse | null>(null);

  const isOriginComplete = Boolean(
    originData.city_id && originData.county_id && originData.province_id
  );
  const isDestinationComplete = Boolean(
    destinationData.city_id && destinationData.county_id && destinationData.province_id
  );
  const ready = isOriginComplete && isDestinationComplete;

  const handleOriginChange = (value: GeoValue) => {
    setResult(null);
    setOriginData(value);
  };

  const handleDestinationChange = (value: GeoValue) => {
    setResult(null);
    setDestinationData(value);
  };

  const updateContact = (field: "name" | "phone" | "email" | "note", value: string) => {
    setResult(null);
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const resetAll = () => {
    setOriginData({});
    setDestinationData({});
    setResult(null);
    setContact({ name: "", phone: "", email: "", note: "" });
  };

  const submitRequest = async () => {
    if (!ready || submitting) return;
    setResult(null);
    setSubmitting(true);
    try {
      const payload = {
        origin_province_id: originData.province_id,
        origin_county_id: originData.county_id,
        origin_city_id: originData.city_id,
        dest_province_id: destinationData.province_id,
        dest_county_id: destinationData.county_id,
        dest_city_id: destinationData.city_id,
        contact_name: contact.name || undefined,
        contact_phone: contact.phone || undefined,
        contact_email: contact.email || undefined,
        note_text: contact.note || undefined,
      };
      const response = await requestApi.create(payload);
      setResult(response);
    } catch (error) {
      alert("خطا در ثبت درخواست");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            درخواست حمل بار
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مبدأ و مقصد خود را انتخاب کرده و سپس جزئیات بار را وارد نمایید
          </p>
        </div>

        {/* Process Stepper */}
        <ProcessStepper />

        {/* Location Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4">
              <CascadingSelect
                label="مبدأ"
                value={originData}
                onChange={handleOriginChange}
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4">
              <CascadingSelect
                label="مقصد"
                value={destinationData}
                onChange={handleDestinationChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          {!ready && (
            <div className="rounded-md p-3 text-sm bg-muted/40">
              لطفاً ابتدا مبدأ و مقصد را انتخاب کنید.
            </div>
          )}

          <button
            type="button"
            onClick={resetAll}
            className="text-xs underline"
          >
            ریست مبدأ/مقصد
          </button>

          {ready && (
            <pre className="bg-muted/30 p-3 rounded-md text-xs overflow-auto">
              {JSON.stringify(
                {
                  origin_province_id: originData.province_id,
                  origin_county_id: originData.county_id,
                  origin_city_id: originData.city_id,
                  dest_province_id: destinationData.province_id,
                  dest_county_id: destinationData.county_id,
                  dest_city_id: destinationData.city_id,
                },
                null,
                2
              )}
            </pre>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="نام تماس"
              value={contact.name}
              onChange={(e) => updateContact("name", e.target.value)}
              className="w-full"
            />
            <input
              placeholder="تلفن"
              value={contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
              type="tel"
              className="w-full"
            />
            <input
              placeholder="ایمیل"
              value={contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              type="email"
              className="w-full"
            />
            <input
              placeholder="یادداشت کوتاه"
              value={contact.note}
              onChange={(e) => updateContact("note", e.target.value)}
              className="w-full"
            />
          </div>

          <button
            type="button"
            disabled={!ready || submitting}
            onClick={submitRequest}
            className="mt-2 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "در حال ارسال…" : "ارسال درخواست"}
          </button>

          {result && (
            <div className="mt-3 p-3 rounded-md bg-muted/30 text-sm">
              درخواست شما با شماره <b>{result.id}</b> ثبت شد. تا ۲ ساعت آینده کارشناس بازرگانی با شما تماس خواهد گرفت.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;