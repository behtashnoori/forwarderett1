import { useState } from "react";
import Layout from "@/components/Layout";
import ProcessStepper from "@/components/ProcessStepper";
import LocationSelector from "@/components/LocationSelector";
import ShipmentRequestForm from "@/components/ShipmentRequestForm";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const [originData, setOriginData] = useState<any>({});
  const [destinationData, setDestinationData] = useState<any>({});

  const isOriginComplete = originData.city_id && originData.county_id && originData.province_id;
  const isDestinationComplete = destinationData.city_id && destinationData.county_id && destinationData.province_id;

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
            <CardContent className="p-6">
              <LocationSelector
                type="origin"
                onLocationChange={setOriginData}
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <LocationSelector
                type="destination"
                onLocationChange={setDestinationData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Shipment Request Form */}
        <div className="flex justify-center">
          <ShipmentRequestForm
            originComplete={isOriginComplete}
            destinationComplete={isDestinationComplete}
            originData={originData}
            destinationData={destinationData}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;