import { useState } from "react";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProcessStepper from "@/components/ProcessStepper";
import ShipmentRequestForm from "@/components/ShipmentRequestForm";
import { CascadingSelect, GeoValue } from "@/components/CascadingSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  requestApi,
  type LocationSummary,
  type ShipmentRequestDetails,
} from "@/lib/api";

const LandingPage = () => {
  const [originData, setOriginData] = useState<GeoValue>({});
  const [destinationData, setDestinationData] = useState<GeoValue>({});
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"locations" | "details">("locations");
  const [requestId, setRequestId] = useState<number | null>(null);
  const [details, setDetails] = useState<ShipmentRequestDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isOriginComplete = Boolean(
    originData.city_id && originData.county_id && originData.province_id
  );
  const isDestinationComplete = Boolean(
    destinationData.city_id && destinationData.county_id && destinationData.province_id
  );
  const ready = isOriginComplete && isDestinationComplete;

  const handleOriginChange = (value: GeoValue) => {
    setOriginData(value);
  };

  const handleDestinationChange = (value: GeoValue) => {
    setDestinationData(value);
  };

  const resetAll = () => {
    setOriginData({});
    setDestinationData({});
    setStage("locations");
    setRequestId(null);
    setDetails(null);
    setDetailsError(null);
    setSubmitError(null);
  };

  const loadDetails = async (id: number) => {
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const record = await requestApi.get(id);
      setDetails(record);
    } catch (error) {
      console.error(error);
      setDetailsError("خطا در دریافت اطلاعات از سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!ready || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        origin_province_id: originData.province_id,
        origin_county_id: originData.county_id,
        origin_city_id: originData.city_id,
        dest_province_id: destinationData.province_id,
        dest_county_id: destinationData.county_id,
        dest_city_id: destinationData.city_id,
      };
      const response = await requestApi.create(payload);
      setRequestId(response.id);
      setStage("details");
      await loadDetails(response.id);
    } catch (error) {
      console.error(error);
      setSubmitError("ثبت درخواست با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatLocation = (location: LocationSummary | undefined | null) => {
    if (!location) return "—";
    const parts = [
      location.city?.name_fa,
      location.county?.name_fa,
      location.province?.name_fa,
    ].filter(Boolean);
    return parts.length ? parts.join("، ") : "—";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            درخواست حمل بار
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مبدأ و مقصد خود را انتخاب کرده و سپس جزئیات بار را وارد نمایید
          </p>
        </div>

        <ProcessStepper />

        {stage === "locations" && (
          <>
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

              {submitError && (
                <div className="rounded-md p-3 text-sm bg-destructive/10 text-destructive">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                disabled={!ready || submitting}
                onClick={submitRequest}
                className="mt-2 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {submitting ? "در حال ارسال…" : "ثبت و ادامه"}
              </button>
            </div>
          </>
        )}

        {stage === "details" && (
          <div className="max-w-5xl mx-auto mb-10 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>اطلاعات ثبت‌شده</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">شماره درخواست</div>
                    <div className="text-lg font-semibold persian-nums">
                      {requestId ?? "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-xs underline"
                  >
                    بازگشت به انتخاب مبدأ/مقصد
                  </button>
                </div>

                {detailsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال بارگذاری اطلاعات از سرور…
                  </div>
                )}

                {detailsError && (
                  <div className="space-y-3">
                    <div className="rounded-md p-3 text-sm bg-destructive/10 text-destructive">
                      {detailsError}
                    </div>
                    {requestId && (
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => loadDetails(requestId)}
                      >
                        تلاش مجدد
                      </button>
                    )}
                  </div>
                )}

                {details && !detailsError && !detailsLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">مبدأ</div>
                      <div className="font-medium">
                        {formatLocation(details.origin)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">مقصد</div>
                      <div className="font-medium">
                        {formatLocation(details.destination)}
                      </div>
                    </div>
                    {details.note_text && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-muted-foreground">یادداشت</div>
                        <div className="text-sm leading-relaxed">{details.note_text}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {detailsLoading ? (
              <Card className="shadow-card">
                <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  فرم مشخصات کالا پس از بارگذاری اطلاعات نمایش داده می‌شود…
                </CardContent>
              </Card>
            ) : details && !detailsError ? (
              <ShipmentRequestForm
                originComplete
                destinationComplete
                originData={{
                  province_id: details.origin.province?.id,
                  county_id: details.origin.county?.id,
                  city_id: details.origin.city?.id,
                }}
                destinationData={{
                  province_id: details.destination.province?.id,
                  county_id: details.destination.county?.id,
                  city_id: details.destination.city?.id,
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandingPage;
