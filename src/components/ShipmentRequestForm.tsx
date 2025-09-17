import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertCircle } from "lucide-react";

interface ShipmentFormData {
  mode_shipment_mode: string;
  incoterm_code: string;
  is_hazardous: boolean;
  is_refrigerated: boolean;
  commodity_name: string;
  hs_code: string;
  package_type: string;
  units: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  volume_m3?: number;
  ready_date: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  note_text: string;
}

interface ShipmentRequestFormProps {
  originComplete: boolean;
  destinationComplete: boolean;
  originData: any;
  destinationData: any;
}

const ShipmentRequestForm = ({ 
  originComplete, 
  destinationComplete, 
  originData, 
  destinationData 
}: ShipmentRequestFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ShipmentFormData>({
    mode_shipment_mode: '',
    incoterm_code: '',
    is_hazardous: false,
    is_refrigerated: false,
    commodity_name: '',
    hs_code: '',
    package_type: '',
    units: 1,
    weight_kg: undefined,
    volume_m3: undefined,
    ready_date: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    note_text: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const modes = [
    { value: 'ROAD', label: 'جاده‌ای' },
    { value: 'RAIL', label: 'ریلی' },
    { value: 'SEA', label: 'دریایی' },
    { value: 'AIR', label: 'هوایی' }
  ];

  const incoterms = [
    { code: 'EXW', name_fa: 'تحویل در کارخانه' },
    { code: 'FCA', name_fa: 'تحویل رایگان به حامل' },
    { code: 'CPT', name_fa: 'حمل پرداخت شده تا' },
    { code: 'CIP', name_fa: 'حمل و بیمه پرداخت شده تا' },
    { code: 'DAP', name_fa: 'تحویل در محل' },
    { code: 'DPU', name_fa: 'تحویل در محل تخلیه شده' },
    { code: 'DDP', name_fa: 'تحویل با پرداخت عوارض' }
  ];

  const packageTypes = [
    { value: 'BOX', label: 'جعبه' },
    { value: 'PALLET', label: 'پالت' },
    { value: 'BAG', label: 'کیسه' },
    { value: 'DRUM', label: 'درام' },
    { value: 'CONTAINER', label: 'کانتینر' }
  ];

  const handleInputChange = (field: keyof ShipmentFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const isFormValid = () => {
    if (!originComplete || !destinationComplete) return false;
    
    const required = [
      'mode_shipment_mode',
      'incoterm_code', 
      'commodity_name',
      'package_type',
      'contact_name'
    ];
    
    const hasRequiredFields = required.every(field => formData[field as keyof ShipmentFormData]);
    const hasContact = formData.contact_phone || formData.contact_email;
    const hasWeightOrVolume = formData.weight_kg || formData.volume_m3;
    
    // If dimensions provided, all must be > 0
    const dimensionsValid = !formData.length_cm || 
      (formData.length_cm > 0 && formData.width_cm! > 0 && formData.height_cm! > 0);
    
    return hasRequiredFields && hasContact && hasWeightOrVolume && dimensionsValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "خطا در ارسال",
        description: "لطفاً تمام فیلدهای ضروری را تکمیل کنید",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.floor(Math.random() * 10000) + 1000 });
        }, 1000);
      });

      const trackingNumber = (response as any).id.toString();
      setTrackingId(trackingNumber);
      setSubmitted(true);

      toast({
        title: "درخواست ثبت شد",
        description: `شماره پیگیری: ${trackingNumber}`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "خطا در ارسال",
        description: "لطفاً مجدداً تلاش کنید",
        variant: "destructive"
      });
    }
  };

  if (!originComplete || !destinationComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle size={24} />
            <p>لطفاً ابتدا مبدأ و مقصد را انتخاب کنید</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted && trackingId) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-card">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-success-foreground" />
            </div>
            <h3 className="text-xl font-bold text-success mb-2">درخواست شما ثبت شد</h3>
            <p className="text-muted-foreground mb-4">
              تا ۲ ساعت آینده کارشناس بازرگانی با شما تماس خواهد گرفت
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">شماره پیگیری</p>
              <p className="text-2xl font-bold text-primary persian-nums">{trackingId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>جزئیات محموله</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode and Incoterm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mode">نحوه حمل *</Label>
              <Select onValueChange={(value) => handleInputChange('mode_shipment_mode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="incoterm">شرایط تحویل *</Label>
              <Select onValueChange={(value) => handleInputChange('incoterm_code', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {incoterms.map((term) => (
                    <SelectItem key={term.code} value={term.code}>
                      {term.code} - {term.name_fa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Special conditions */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hazardous"
                checked={formData.is_hazardous}
                onCheckedChange={(checked) => handleInputChange('is_hazardous', checked)}
              />
              <Label htmlFor="hazardous">کالای خطرناک</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="refrigerated"
                checked={formData.is_refrigerated}
                onCheckedChange={(checked) => handleInputChange('is_refrigerated', checked)}
              />
              <Label htmlFor="refrigerated">یخچالی</Label>
            </div>
          </div>

          {/* Commodity details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commodity">نام کالا *</Label>
              <Input
                id="commodity"
                value={formData.commodity_name}
                onChange={(e) => handleInputChange('commodity_name', e.target.value)}
                placeholder="مثال: قطعات یدکی خودرو"
              />
            </div>
            <div>
              <Label htmlFor="hs_code">کد HS</Label>
              <Input
                id="hs_code"
                value={formData.hs_code}
                onChange={(e) => handleInputChange('hs_code', e.target.value)}
                placeholder="8708.99.00"
                className="ltr-input"
              />
            </div>
          </div>

          {/* Package and units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package_type">نوع بسته‌بندی *</Label>
              <Select onValueChange={(value) => handleInputChange('package_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="units">تعداد</Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) => handleInputChange('units', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length">طول (سانتی‌متر)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                value={formData.length_cm || ''}
                onChange={(e) => handleInputChange('length_cm', parseFloat(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="width">عرض (سانتی‌متر)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                value={formData.width_cm || ''}
                onChange={(e) => handleInputChange('width_cm', parseFloat(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="height">ارتفاع (سانتی‌متر)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                value={formData.height_cm || ''}
                onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Weight and Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">وزن (کیلوگرم) *</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || undefined)}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="volume">حجم (متر مکعب) *</Label>
              <Input
                id="volume"
                type="number"
                min="0"
                step="0.01"
                value={formData.volume_m3 || ''}
                onChange={(e) => handleInputChange('volume_m3', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Ready date */}
          <div>
            <Label htmlFor="ready_date">آماده بارگیری در</Label>
            <Input
              id="ready_date"
              type="datetime-local"
              value={formData.ready_date}
              onChange={(e) => handleInputChange('ready_date', e.target.value)}
            />
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="font-semibold">اطلاعات تماس</h4>
            <div>
              <Label htmlFor="contact_name">نام تماس *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                placeholder="نام و نام خانوادگی"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">تلفن همراه</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="09123456789"
                  className="ltr-input"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">ایمیل</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="example@email.com"
                  className="ltr-input"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="note">توضیحات (حداکثر ۱۴۰ کاراکتر)</Label>
            <Textarea
              id="note"
              value={formData.note_text}
              onChange={(e) => handleInputChange('note_text', e.target.value.slice(0, 140))}
              placeholder="توضیحات اضافی در مورد محموله..."
              maxLength={140}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.note_text.length}/140 کاراکتر
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid()}
            size="lg"
          >
            ارسال درخواست
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShipmentRequestForm;