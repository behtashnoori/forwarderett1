import { useState } from "react";

import Layout from "@/components/Layout";
import ProcessStepper from "@/components/ProcessStepper";
import GoodsDetails from "@/components/GoodsDetails";
import { CascadingSelect, GeoValue } from "@/components/CascadingSelect";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { catalogCache, requestApi, type ShipmentRequestDetails } from "@/lib/api";

const LandingPage = () => {
  const { toast } = useToast();
  const [originData, setOriginData] = useState<GeoValue>({});
  const [destinationData, setDestinationData] = useState<GeoValue>({});
  const [goodsResetKey, setGoodsResetKey] = useState(0);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [requestDetails, setRequestDetails] = useState<ShipmentRequestDetails | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const isOriginComplete = Boolean(
    originData.city_id && originData.county_id && originData.province_id,
  );
  const isDestinationComplete = Boolean(
    destinationData.city_id && destinationData.county_id && destinationData.province_id,
  );
  const ready = isOriginComplete && isDestinationComplete;

  const clearRequestState = () => {
    setRequestDetails(null);
    setRequestError(null);
    setGoodsResetKey((prev) => prev + 1);
  };

  const parseErrorMessage = (error: unknown, fallback: string) => {
    if (!error) return fallback;
    if (error instanceof Error) {
      const raw = error.message?.trim();
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { error?: unknown };
          if (parsed && typeof parsed.error === "string") {
            return parsed.error;
          }
        } catch {
          // ignore parsing failure, fall back to raw string
        }
        return raw;
      }
    }
    if (typeof error === "string") {
      const trimmed = error.trim();
      if (!trimmed) return fallback;
      try {
        const parsed = JSON.parse(trimmed) as { error?: unknown };
        if (parsed && typeof parsed.error === "string") {
          return parsed.error;
        }
      } catch {
        return trimmed;
      }
      return trimmed;
    }
    return fallback;
  };

  const fetchRequestDetails = async (id: number) => {
    const fallback = "دریافت اطلاعات درخواست با خطا مواجه شد.";
    try {
      const details = await requestApi.get(id);
      setRequestDetails(details);
      setRequestError(null);
      return details;
    } catch (error) {
      const message = parseErrorMessage(error, fallback);
      setRequestError(message);
      throw new Error(message);
    }
  };

  const handleOriginChange = (value: GeoValue) => {
    if (requestDetails) {
      clearRequestState();
    }
    setOriginData(value);
  };

  const handleDestinationChange = (value: GeoValue) => {
    if (requestDetails) {
      clearRequestState();
    }
    setDestinationData(value);
  };

  const handleCreateRequest = async () => {
    if (!ready || creatingRequest) {
      return;
    }

    setCreatingRequest(true);
    setRequestError(null);
    const fallback = "ثبت مبدأ و مقصد با خطا مواجه شد.";

    try {
      const response = await requestApi.create({
        origin_province_id: originData.province_id!,
        origin_county_id: originData.county_id!,
        origin_city_id: originData.city_id!,
        dest_province_id: destinationData.province_id!,
        dest_county_id: destinationData.county_id!,
        dest_city_id: destinationData.city_id!,
      });

      toast({
        title: "مبدأ و مقصد ثبت شد.",
        description: `شماره درخواست ${response.id} با وضعیت ${response.status} ایجاد شد.`,
      });

      await fetchRequestDetails(response.id);
    } catch (error) {
      const message = parseErrorMessage(error, fallback);
      setRequestError(message);
      toast({
        title: "ثبت ناموفق بود.",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCreatingRequest(false);
    }
  };

  const refreshCurrentRequest = async () => {
    if (!requestDetails) {
      return;
    }
    return fetchRequestDetails(requestDetails.id);
  };

  const resetAll = () => {
    setOriginData({});
    setDestinationData({});
    clearRequestState();
    setCreatingRequest(false);
    catalogCache.clear();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">درخواست حمل بار</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مبدأ و مقصد خود را انتخاب کرده و سپس جزئیات بار را وارد نمایید
          </p>
        </div>

        <ProcessStepper />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6 space-y-4">
              <CascadingSelect label="مبدأ" value={originData} onChange={handleOriginChange} />
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

        <div className="max-w-2xl mx-auto mb-10 space-y-4">
          {!ready && (
            <div className="rounded-md p-3 text-sm bg-muted/40">
              لطفاً ابتدا مبدأ و مقصد را انتخاب کنید تا فرم مشخصات کالا باز شود.
            </div>
          )}

          {ready && !requestDetails && (
            <div className="space-y-4">
              <div className="rounded-md border border-muted-foreground/20 bg-muted/30 p-3 text-sm text-muted-foreground">
                برای ادامه، مبدأ و مقصد انتخاب‌شده را ثبت کنید تا فرم جزئیات کالا فعال شود.
              </div>
              {requestError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {requestError}
                </div>
              )}
              <div className="flex justify-center">
                <Button onClick={handleCreateRequest} disabled={creatingRequest}>
                  {creatingRequest ? "در حال ثبت..." : "ثبت مبدأ و مقصد"}
                </Button>
              </div>
            </div>
          )}

          {ready && requestDetails && (
            <div className="space-y-3">
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                درخواست شماره {requestDetails.id} ذخیره شد. لطفاً مشخصات کالا را تکمیل کنید.
              </div>
              {requestError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {requestError}
                </div>
              )}
            </div>
          )}
        </div>

        {ready && requestDetails && (
          <div className="max-w-5xl mx-auto mb-10">
            <GoodsDetails
              requestId={requestDetails.id}
              request={requestDetails}
              resetKey={goodsResetKey}
              onResetAll={resetAll}
              onRefreshRequest={refreshCurrentRequest}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandingPage;
