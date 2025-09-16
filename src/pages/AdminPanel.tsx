import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface Incoterm {
  code: string;
  name_fa: string;
  desc_fa: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  
  // Incoterms state
  const [incoterms, setIncoterms] = useState<Incoterm[]>([
    { code: 'EXW', name_fa: 'تحویل در کارخانه', desc_fa: 'فروشنده کالا را در محل خود آماده تحویل می‌کند' },
    { code: 'FCA', name_fa: 'تحویل رایگان به حامل', desc_fa: 'فروشنده کالا را به حامل معین شده توسط خریدار تحویل می‌دهد' },
    { code: 'CPT', name_fa: 'حمل پرداخت شده تا', desc_fa: 'فروشنده حمل را تا مقصد معین پرداخت می‌کند' },
    { code: 'CIP', name_fa: 'حمل و بیمه پرداخت شده تا', desc_fa: 'فروشنده حمل و بیمه را تا مقصد معین پرداخت می‌کند' },
    { code: 'DAP', name_fa: 'تحویل در محل', desc_fa: 'فروشنده کالا را در محل معین شده توسط خریدار تحویل می‌دهد' },
    { code: 'DPU', name_fa: 'تحویل در محل تخلیه شده', desc_fa: 'فروشنده کالا را در محل معین تخلیه شده تحویل می‌دهد' },
    { code: 'DDP', name_fa: 'تحویل با پرداخت عوارض', desc_fa: 'فروشنده تمام هزینه‌ها شامل عوارض گمرکی را پرداخت می‌کند' }
  ]);
  
  const [editingIncoterm, setEditingIncoterm] = useState<Incoterm | null>(null);
  const [newIncoterm, setNewIncoterm] = useState<Incoterm>({ code: '', name_fa: '', desc_fa: '' });
  const [showAddIncoterm, setShowAddIncoterm] = useState(false);

  // Lookups state
  const [modes, setModes] = useState(['ROAD', 'RAIL', 'SEA', 'AIR']);
  const [packageTypes, setPackageTypes] = useState(['BOX', 'PALLET', 'BAG', 'DRUM', 'CONTAINER']);
  const [newMode, setNewMode] = useState('');
  const [newPackageType, setNewPackageType] = useState('');

  // Incoterm handlers
  const handleSaveIncoterm = (incoterm: Incoterm) => {
    if (editingIncoterm) {
      setIncoterms(prev => prev.map(item => 
        item.code === editingIncoterm.code ? incoterm : item
      ));
      setEditingIncoterm(null);
      toast({ title: "به‌روزرسانی شد", description: `اینکوترم ${incoterm.code} ویرایش شد` });
    } else {
      setIncoterms(prev => [...prev, incoterm]);
      setNewIncoterm({ code: '', name_fa: '', desc_fa: '' });
      setShowAddIncoterm(false);
      toast({ title: "اضافه شد", description: `اینکوترم ${incoterm.code} اضافه شد` });
    }
  };

  const handleDeleteIncoterm = (code: string) => {
    setIncoterms(prev => prev.filter(item => item.code !== code));
    toast({ title: "حذف شد", description: `اینکوترم ${code} حذف شد` });
  };

  const handleAddMode = () => {
    if (newMode && !modes.includes(newMode)) {
      setModes(prev => [...prev, newMode]);
      setNewMode('');
      toast({ title: "اضافه شد", description: `روش حمل ${newMode} اضافه شد` });
    }
  };

  const handleDeleteMode = (mode: string) => {
    setModes(prev => prev.filter(m => m !== mode));
    toast({ title: "حذف شد", description: `روش حمل ${mode} حذف شد` });
  };

  const handleAddPackageType = () => {
    if (newPackageType && !packageTypes.includes(newPackageType)) {
      setPackageTypes(prev => [...prev, newPackageType]);
      setNewPackageType('');
      toast({ title: "اضافه شد", description: `نوع بسته‌بندی ${newPackageType} اضافه شد` });
    }
  };

  const handleDeletePackageType = (type: string) => {
    setPackageTypes(prev => prev.filter(t => t !== type));
    toast({ title: "حذف شد", description: `نوع بسته‌بندی ${type} حذف شد` });
  };

  const IncotermForm = ({ incoterm, onSave, onCancel }: {
    incoterm: Incoterm;
    onSave: (incoterm: Incoterm) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(incoterm);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.code && formData.name_fa) {
        onSave(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">کد اینکوترم *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="مثال: FOB"
              className="ltr-input"
              maxLength={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="name_fa">نام فارسی *</Label>
            <Input
              id="name_fa"
              value={formData.name_fa}
              onChange={(e) => setFormData({...formData, name_fa: e.target.value})}
              placeholder="مثال: آزاد روی کشتی"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="desc_fa">توضیحات</Label>
          <Textarea
            id="desc_fa"
            value={formData.desc_fa}
            onChange={(e) => setFormData({...formData, desc_fa: e.target.value})}
            placeholder="توضیح کامل این اینکوترم..."
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex items-center gap-2">
            <Save size={16} />
            ذخیره
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
            <X size={16} />
            انصراف
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">پنل مدیریت</h1>
          <p className="text-muted-foreground">
            مدیریت اینکوترم‌ها و لیست‌های مربوط به سیستم
          </p>
        </div>

        <Tabs defaultValue="incoterms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoterms">اینکوترم‌ها</TabsTrigger>
            <TabsTrigger value="lookups">لیست‌های سیستم</TabsTrigger>
          </TabsList>
          
          <TabsContent value="incoterms" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>مدیریت اینکوترم‌ها</CardTitle>
                  <Button
                    onClick={() => setShowAddIncoterm(true)}
                    className="flex items-center gap-2"
                    disabled={showAddIncoterm}
                  >
                    <Plus size={16} />
                    اضافه کردن
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new incoterm form */}
                {showAddIncoterm && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">اینکوترم جدید</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IncotermForm
                        incoterm={newIncoterm}
                        onSave={handleSaveIncoterm}
                        onCancel={() => {
                          setShowAddIncoterm(false);
                          setNewIncoterm({ code: '', name_fa: '', desc_fa: '' });
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Incoterms list */}
                <div className="space-y-4">
                  {incoterms.map((incoterm) => (
                    <Card key={incoterm.code} className="shadow-card">
                      <CardContent className="p-6">
                        {editingIncoterm?.code === incoterm.code ? (
                          <IncotermForm
                            incoterm={editingIncoterm}
                            onSave={handleSaveIncoterm}
                            onCancel={() => setEditingIncoterm(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-bold text-primary ltr-input">
                                  {incoterm.code}
                                </span>
                                <span className="text-lg font-semibold">
                                  {incoterm.name_fa}
                                </span>
                              </div>
                              {incoterm.desc_fa && (
                                <p className="text-muted-foreground text-sm">
                                  {incoterm.desc_fa}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingIncoterm(incoterm)}
                                className="flex items-center gap-1"
                              >
                                <Edit size={14} />
                                ویرایش
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteIncoterm(incoterm.code)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                حذف
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lookups" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipment Modes */}
              <Card>
                <CardHeader>
                  <CardTitle>روش‌های حمل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value.toUpperCase())}
                      placeholder="روش جدید (مثال: SHIP)"
                      className="ltr-input"
                    />
                    <Button onClick={handleAddMode} disabled={!newMode}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {modes.map((mode) => (
                      <div key={mode} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-mono font-semibold ltr-input">{mode}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMode(mode)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Package Types */}
              <Card>
                <CardHeader>
                  <CardTitle>انواع بسته‌بندی</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newPackageType}
                      onChange={(e) => setNewPackageType(e.target.value.toUpperCase())}
                      placeholder="بسته‌بندی جدید (مثال: CRATE)"
                      className="ltr-input"
                    />
                    <Button onClick={handleAddPackageType} disabled={!newPackageType}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {packageTypes.map((type) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-mono font-semibold ltr-input">{type}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePackageType(type)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;