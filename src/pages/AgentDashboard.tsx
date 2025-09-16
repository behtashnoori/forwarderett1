import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Phone, Clock, CheckCircle, AlertTriangle, Snowflake, Search, Filter } from "lucide-react";

interface ShipmentRequest {
  id: number;
  created_at: string;
  origin_province: string;
  origin_county: string;
  origin_city: string;
  dest_province: string;
  dest_county: string;
  dest_city: string;
  mode_shipment_mode: string;
  incoterm_code: string;
  is_hazardous: boolean;
  is_refrigerated: boolean;
  commodity_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  units: number;
  weight_kg?: number;
  volume_m3?: number;
  status_request_status: 'NEW' | 'CONTACTED' | 'CLOSED';
  sla_due_at: string;
}

const AgentDashboard = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setRequests([
        {
          id: 1001,
          created_at: '2024-01-15T10:30:00Z',
          origin_province: 'تهران',
          origin_county: 'تهران',
          origin_city: 'تهران',
          dest_province: 'اصفهان',
          dest_county: 'اصفهان',
          dest_city: 'اصفهان',
          mode_shipment_mode: 'ROAD',
          incoterm_code: 'CPT',
          is_hazardous: false,
          is_refrigerated: true,
          commodity_name: 'مواد غذایی یخ زده',
          contact_name: 'علی احمدی',
          contact_phone: '09123456789',
          contact_email: 'ali@example.com',
          units: 10,
          weight_kg: 500,
          volume_m3: 2.5,
          status_request_status: 'NEW',
          sla_due_at: '2024-01-15T12:30:00Z'
        },
        {
          id: 1002,
          created_at: '2024-01-15T09:15:00Z',
          origin_province: 'فارس',
          origin_county: 'شیراز',
          origin_city: 'شیراز',
          dest_province: 'تهران',
          dest_county: 'تهران',
          dest_city: 'تهران',
          mode_shipment_mode: 'AIR',
          incoterm_code: 'DDP',
          is_hazardous: true,
          is_refrigerated: false,
          commodity_name: 'مواد شیمیایی',
          contact_name: 'مریم کریمی',
          contact_phone: '09987654321',
          contact_email: '',
          units: 5,
          weight_kg: 200,
          status_request_status: 'CONTACTED',
          sla_due_at: '2024-01-15T11:15:00Z'
        },
        {
          id: 1003,
          created_at: '2024-01-14T16:45:00Z',
          origin_province: 'خراسان رضوی',
          origin_county: 'مشهد',
          origin_city: 'مشهد',
          dest_province: 'گیلان',
          dest_county: 'رشت',
          dest_city: 'رشت',
          mode_shipment_mode: 'RAIL',
          incoterm_code: 'FCA',
          is_hazardous: false,
          is_refrigerated: false,
          commodity_name: 'محصولات کشاورزی',
          contact_name: 'حسن محمدی',
          contact_phone: '09111222333',
          contact_email: 'hassan@example.com',
          units: 20,
          volume_m3: 5.0,
          status_request_status: 'CLOSED',
          sla_due_at: '2024-01-14T18:45:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="secondary">جدید</Badge>;
      case 'CONTACTED':
        return <Badge className="bg-warning text-warning-foreground">تماس گرفته شد</Badge>;
      case 'CLOSED':
        return <Badge className="bg-success text-success-foreground">بسته شد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: string) => {
    const modes = {
      'ROAD': 'جاده‌ای',
      'RAIL': 'ریلی',
      'SEA': 'دریایی',
      'AIR': 'هوایی'
    };
    return <Badge variant="outline">{modes[mode as keyof typeof modes] || mode}</Badge>;
  };

  const getSlaCountdown = (slaDate: string) => {
    const now = new Date();
    const sla = new Date(slaDate);
    const diff = sla.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return <Badge variant="destructive">منقضی شده</Badge>;
    }
    
    if (hours < 1) {
      return <Badge className="bg-warning text-warning-foreground">{minutes} دقیقه</Badge>;
    }
    
    return <Badge className="bg-accent text-accent-foreground">{hours}:{minutes.toString().padStart(2, '0')}</Badge>;
  };

  const handleStatusChange = async (id: number, newStatus: 'CONTACTED' | 'CLOSED') => {
    try {
      // Mock API call
      setRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status_request_status: newStatus } : req
        )
      );
      
      toast({
        title: "وضعیت به‌روزرسانی شد",
        description: `درخواست #${id} به ${newStatus === 'CONTACTED' ? 'تماس گرفته شد' : 'بسته شد'} تغییر یافت`,
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی وضعیت",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      req.commodity_name.toLowerCase().includes(searchLower) ||
      req.contact_name.toLowerCase().includes(searchLower) ||
      req.id.toString().includes(searchTerm)
    );
  });

  const getRequestsByStatus = (status: string) => {
    return filteredRequests.filter(req => req.status_request_status === status);
  };

  const RequestCard = ({ request }: { request: ShipmentRequest }) => (
    <Card className="mb-4 shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">#{request.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(request.created_at).toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(request.status_request_status)}
            {getSlaCountdown(request.sla_due_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Route */}
          <div>
            <h4 className="font-semibold mb-2">مسیر</h4>
            <div className="flex items-center gap-2 text-sm">
              <span>{request.origin_county} ({request.origin_province})</span>
              <span>←</span>
              <span>{request.dest_county} ({request.dest_province})</span>
            </div>
          </div>

          {/* Shipment details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-1">نوع حمل</h5>
              {getModeBadge(request.mode_shipment_mode)}
            </div>
            <div>
              <h5 className="font-medium mb-1">شرایط تحویل</h5>
              <Badge variant="outline">{request.incoterm_code}</Badge>
            </div>
          </div>

          {/* Commodity */}
          <div>
            <h5 className="font-medium mb-1">کالا</h5>
            <p className="text-sm">{request.commodity_name}</p>
            <div className="flex gap-2 mt-1">
              {request.is_hazardous && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle size={12} className="ml-1" />
                  خطرناک
                </Badge>
              )}
              {request.is_refrigerated && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  <Snowflake size={12} className="ml-1" />
                  یخچالی
                </Badge>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">تعداد:</span>
              <span className="mr-2 persian-nums">{request.units}</span>
            </div>
            {request.weight_kg && (
              <div>
                <span className="text-muted-foreground">وزن:</span>
                <span className="mr-2 persian-nums">{request.weight_kg} کیلو</span>
              </div>
            )}
            {request.volume_m3 && (
              <div>
                <span className="text-muted-foreground">حجم:</span>
                <span className="mr-2 persian-nums">{request.volume_m3} متر مکعب</span>
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-medium mb-1">تماس</h5>
            <p className="text-sm">{request.contact_name}</p>
            {request.contact_phone && (
              <p className="text-sm text-muted-foreground ltr-input">{request.contact_phone}</p>
            )}
            {request.contact_email && (
              <p className="text-sm text-muted-foreground ltr-input">{request.contact_email}</p>
            )}
          </div>

          {/* Actions */}
          {request.status_request_status === 'NEW' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                size="sm"
                onClick={() => handleStatusChange(request.id, 'CONTACTED')}
                className="flex items-center gap-2"
              >
                <Phone size={16} />
                تماس گرفتم
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(request.id, 'CLOSED')}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} />
                بستن
              </Button>
            </div>
          )}
          {request.status_request_status === 'CONTACTED' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(request.id, 'CLOSED')}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} />
                بستن
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Clock className="animate-spin mx-auto mb-4" size={48} />
            <p>در حال بارگذاری...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">داشبورد کارشناس</h1>
          
          {/* Search and filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-3 text-muted-foreground" size={20} />
              <Input
                placeholder="جستجو در درخواست‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={20} />
              فیلتر
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">درخواست‌های جدید</p>
                    <p className="text-2xl font-bold persian-nums">
                      {getRequestsByStatus('NEW').length}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">تماس گرفته شد</p>
                    <p className="text-2xl font-bold persian-nums">
                      {getRequestsByStatus('CONTACTED').length}
                    </p>
                  </div>
                  <div className="bg-warning/10 p-3 rounded-full">
                    <Phone className="text-warning" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">بسته شده</p>
                    <p className="text-2xl font-bold persian-nums">
                      {getRequestsByStatus('CLOSED').length}
                    </p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-full">
                    <CheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Requests by status */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">جدید ({getRequestsByStatus('NEW').length})</TabsTrigger>
            <TabsTrigger value="contacted">تماس گرفته شد ({getRequestsByStatus('CONTACTED').length})</TabsTrigger>
            <TabsTrigger value="closed">بسته شد ({getRequestsByStatus('CLOSED').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="mt-6">
            <div>
              {getRequestsByStatus('NEW').map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
              {getRequestsByStatus('NEW').length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">درخواست جدیدی وجود ندارد</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="contacted" className="mt-6">
            <div>
              {getRequestsByStatus('CONTACTED').map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
              {getRequestsByStatus('CONTACTED').length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Phone size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">هیچ درخواستی در این وضعیت نیست</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="closed" className="mt-6">
            <div>
              {getRequestsByStatus('CLOSED').map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
              {getRequestsByStatus('CLOSED').length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">هیچ درخواست بسته‌ای وجود ندارد</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AgentDashboard;