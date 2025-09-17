import { useState } from "react";

import Layout from "@/components/Layout";
import ProcessStepper from "@/components/ProcessStepper";
import GoodsDetails from "@/components/GoodsDetails";
import { CascadingSelect, GeoValue } from "@/components/CascadingSelect";
import { Card, CardContent } from "@/components/ui/card";
import { catalogCache } from "@/lib/api";

const LandingPage = () => {
  const [originData, setOriginData] = useState<GeoValue>({});
  const [destinationData, setDestinationData] = useState<GeoValue>({});
  const [goodsResetKey, setGoodsResetKey] = useState(0);

  const isOriginComplete = Boolean(
    originData.city_id && originData.county_id && originData.province_id,
  );
  const isDestinationComplete = Boolean(
    destinationData.city_id && destinationData.county_id && destinationData.province_id,
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
    setGoodsResetKey((prev) => prev + 1);
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

          {ready && (
            <div className="rounded-md border border-muted-foreground/20 bg-muted/30 p-3 text-sm text-muted-foreground">
              مبدأ و مقصد انتخاب شده‌اند. لطفاً جزئیات محموله را تکمیل کنید.
            </div>
          )}
        </div>

        {ready && (
          <div className="max-w-5xl mx-auto mb-10">
            <GoodsDetails
              origin={originData}
              destination={destinationData}
              resetKey={goodsResetKey}
              onResetAll={resetAll}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandingPage;
