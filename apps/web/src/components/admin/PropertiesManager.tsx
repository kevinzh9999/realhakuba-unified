// apps/web/src/components/admin/PropertiesManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Home, 
  MapPin,
  Users,
  Bed,
  Bath,
  PawPrint,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PropertySummary {
  sqm: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  petsAllowed: boolean;
}

interface BedConfig {
  double: number;
  single: number;
  tatami: number;
}

interface Bedroom {
  image?: string;
  beds: BedConfig;
}

interface LocalizedString {
  en: string;
  ja: string;
  zh: string;
}

interface Highlight {
  heading: LocalizedString;
  content: LocalizedString;
}

interface Location {
  mapEmbed: string;
  area: LocalizedString;
  description: LocalizedString;
}

interface Property {
  title: LocalizedString;
  subtitle: LocalizedString;
  price: number;
  hero: string;
  gallery: string[];
  details: LocalizedString;
  highlights?: Highlight[];
  summary: PropertySummary;
  bedrooms: Bedroom[];
  amenities?: Record<string, boolean>;
  location?: Location;
}

interface PropertiesConfig {
  [key: string]: Property;
}

interface PropertiesManagerProps {
  locale: string;
}

const DEFAULT_LOCALIZED_STRING: LocalizedString = {
  en: '',
  ja: '',
  zh: ''
};

const DEFAULT_PROPERTY: Property = {
  title: DEFAULT_LOCALIZED_STRING,
  subtitle: DEFAULT_LOCALIZED_STRING,
  price: 0,
  hero: '',
  gallery: [],
  details: DEFAULT_LOCALIZED_STRING,
  highlights: [],
  summary: {
    sqm: 0,
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    petsAllowed: false
  },
  bedrooms: [{
    beds: { double: 0, single: 0, tatami: 0 }
  }],
  amenities: {},
  location: {
    mapEmbed: '',
    area: DEFAULT_LOCALIZED_STRING,
    description: DEFAULT_LOCALIZED_STRING
  }
};

export default function PropertiesManager({ locale }: PropertiesManagerProps) {
  const [properties, setProperties] = useState<PropertiesConfig>({});
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 加载物业配置
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '加载物业配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const saveProperties = async (updatedProperties: PropertiesConfig) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProperties),
      });

      if (response.ok) {
        setProperties(updatedProperties);
        setMessage({ type: 'success', text: '物业配置保存成功' });
      } else {
        throw new Error('Failed to save properties');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存物业配置失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProperty = () => {
    setIsCreating(true);
    setEditingProperty({ ...DEFAULT_PROPERTY });
    setNewPropertyId('');
  };

  const handleEditProperty = (id: string) => {
    setSelectedProperty(id);
    setEditingProperty({ ...properties[id] });
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm(`确定要删除物业 "${id}" 吗？此操作无法撤销。`)) {
      const updatedProperties = { ...properties };
      delete updatedProperties[id];
      await saveProperties(updatedProperties);
      setSelectedProperty(null);
    }
  };

  const handleSaveProperty = async () => {
    if (!editingProperty) return;

    let propertyId = selectedProperty;
    if (isCreating) {
      if (!newPropertyId.trim()) {
        setMessage({ type: 'error', text: '请输入物业ID' });
        return;
      }
      if (properties[newPropertyId]) {
        setMessage({ type: 'error', text: '物业ID已存在' });
        return;
      }
      propertyId = newPropertyId.trim();
    }

    if (!propertyId) return;

    const updatedProperties = {
      ...properties,
      [propertyId]: editingProperty
    };

    await saveProperties(updatedProperties);
    setEditingProperty(null);
    setSelectedProperty(propertyId);
    setIsCreating(false);
    setNewPropertyId('');
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
    setIsCreating(false);
    setNewPropertyId('');
  };

  const updateEditingProperty = (updates: Partial<Property>) => {
    if (!editingProperty) return;
    setEditingProperty({ ...editingProperty, ...updates });
  };

  const updateLocalizedString = (field: keyof Property, lang: keyof LocalizedString, value: string) => {
    if (!editingProperty) return;
    const current = editingProperty[field] as LocalizedString;
    updateEditingProperty({
      [field]: { ...current, [lang]: value }
    });
  };

  const addHighlight = () => {
    if (!editingProperty) return;
    const newHighlight: Highlight = {
      heading: DEFAULT_LOCALIZED_STRING,
      content: DEFAULT_LOCALIZED_STRING
    };
    updateEditingProperty({
      highlights: [...(editingProperty.highlights || []), newHighlight]
    });
  };

  const updateHighlight = (index: number, field: keyof Highlight, lang: keyof LocalizedString, value: string) => {
    if (!editingProperty?.highlights) return;
    const updatedHighlights = [...editingProperty.highlights];
    updatedHighlights[index] = {
      ...updatedHighlights[index],
      [field]: { ...updatedHighlights[index][field], [lang]: value }
    };
    updateEditingProperty({ highlights: updatedHighlights });
  };

  const removeHighlight = (index: number) => {
    if (!editingProperty?.highlights) return;
    const updatedHighlights = editingProperty.highlights.filter((_, i) => i !== index);
    updateEditingProperty({ highlights: updatedHighlights });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {!editingProperty ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 物业列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>物业列表</CardTitle>
                <Button size="sm" onClick={handleCreateProperty}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建物业
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(properties).map((id) => (
                  <div
                    key={id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProperty === id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProperty(id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{properties[id].title[locale as keyof LocalizedString] || id}</h3>
                        <p className="text-sm text-gray-500">¥{properties[id].price.toLocaleString()}/晚</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProperty(id);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 物业详情 */}
          <div className="lg:col-span-2">
            {selectedProperty && properties[selectedProperty] ? (
              <PropertyDetailView
                property={properties[selectedProperty]}
                propertyId={selectedProperty}
                locale={locale}
                onEdit={() => handleEditProperty(selectedProperty)}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-gray-500">请选择一个物业查看详情</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <PropertyEditForm
          property={editingProperty}
          propertyId={isCreating ? newPropertyId : selectedProperty}
          isCreating={isCreating}
          locale={locale}
          saving={saving}
          onSave={handleSaveProperty}
          onCancel={handleCancelEdit}
          onPropertyIdChange={setNewPropertyId}
          onPropertyChange={updateEditingProperty}
          onLocalizedStringChange={updateLocalizedString}
          onAddHighlight={addHighlight}
          onUpdateHighlight={updateHighlight}
          onRemoveHighlight={removeHighlight}
        />
      )}
    </div>
  );
}

// 物业详情查看组件
function PropertyDetailView({ 
  property, 
  propertyId, 
  locale, 
  onEdit 
}: {
  property: Property;
  propertyId: string;
  locale: string;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Home className="w-5 h-5" />
          <span>{property.title[locale as keyof LocalizedString] || propertyId}</span>
        </CardTitle>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{property.summary.guests} 位客人</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bed className="w-4 h-4 text-gray-500" />
            <span>{property.summary.bedrooms} 间卧室</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bath className="w-4 h-4 text-gray-500" />
            <span>{property.summary.bathrooms} 间浴室</span>
          </div>
          <div className="flex items-center space-x-2">
            <PawPrint className="w-4 h-4 text-gray-500" />
            <span>{property.summary.petsAllowed ? '允许宠物' : '不允许宠物'}</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">价格</h4>
          <p className="text-2xl font-bold text-green-600">¥{property.price.toLocaleString()}/晚</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">描述</h4>
          <p className="text-gray-600">{property.details[locale as keyof LocalizedString]}</p>
        </div>

        {property.location && (
          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>位置</span>
            </h4>
            <p className="text-gray-600">{property.location.area[locale as keyof LocalizedString]}</p>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>图片</span>
          </h4>
          <div className="space-y-2">
            <p><span className="font-medium">主图:</span> {property.hero || '未设置'}</p>
            <p><span className="font-medium">画廊:</span> {property.gallery.length} 张图片</p>
          </div>
        </div>

        {property.highlights && property.highlights.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">特色亮点</h4>
            <div className="space-y-2">
              {property.highlights.map((highlight, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <h5 className="font-medium">{highlight.heading[locale as keyof LocalizedString]}</h5>
                  <p className="text-gray-600">{highlight.content[locale as keyof LocalizedString]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 物业编辑表单组件
function PropertyEditForm({
  property,
  propertyId,
  isCreating,
  locale,
  saving,
  onSave,
  onCancel,
  onPropertyIdChange,
  onPropertyChange,
  onLocalizedStringChange,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight
}: {
  property: Property;
  propertyId: string | null;
  isCreating: boolean;
  locale: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPropertyIdChange: (id: string) => void;
  onPropertyChange: (updates: Partial<Property>) => void;
  onLocalizedStringChange: (field: keyof Property, lang: keyof LocalizedString, value: string) => void;
  onAddHighlight: () => void;
  onUpdateHighlight: (index: number, field: keyof Highlight, lang: keyof LocalizedString, value: string) => void;
  onRemoveHighlight: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isCreating ? '新建物业' : '编辑物业'}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="content">内容</TabsTrigger>
            <TabsTrigger value="details">房间详情</TabsTrigger>
            <TabsTrigger value="location">位置信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {isCreating && (
              <div>
                <Label htmlFor="property-id">物业ID *</Label>
                <Input
                  id="property-id"
                  value={propertyId || ''}
                  onChange={(e) => onPropertyIdChange(e.target.value)}
                  placeholder="例如: riverside-loghouse"
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>标题 (多语言)</Label>
              {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                <div key={lang}>
                  <Label htmlFor={`title-${lang}`} className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                  <Input
                    id={`title-${lang}`}
                    value={property.title[lang as keyof LocalizedString]}
                    onChange={(e) => onLocalizedStringChange('title', lang as keyof LocalizedString, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label>副标题 (多语言)</Label>
              {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                <div key={lang}>
                  <Label htmlFor={`subtitle-${lang}`} className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                  <Input
                    id={`subtitle-${lang}`}
                    value={property.subtitle[lang as keyof LocalizedString]}
                    onChange={(e) => onLocalizedStringChange('subtitle', lang as keyof LocalizedString, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="price">价格 (每晚)</Label>
              <Input
                id="price"
                type="number"
                value={property.price}
                onChange={(e) => onPropertyChange({ price: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="hero">主图URL</Label>
              <Input
                id="hero"
                value={property.hero}
                onChange={(e) => onPropertyChange({ hero: e.target.value })}
                placeholder="/stays/property-name/images/hero.jpg"
              />
            </div>

            <div>
              <Label htmlFor="gallery">画廊图片 (每行一个URL)</Label>
              <Textarea
                id="gallery"
                value={property.gallery.join('\n')}
                onChange={(e) => onPropertyChange({ gallery: e.target.value.split('\n').filter(url => url.trim()) })}
                rows={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <Label>详细描述 (多语言)</Label>
              {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                <div key={lang}>
                  <Label htmlFor={`details-${lang}`} className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                  <Textarea
                    id={`details-${lang}`}
                    value={property.details[lang as keyof LocalizedString]}
                    onChange={(e) => onLocalizedStringChange('details', lang as keyof LocalizedString, e.target.value)}
                    rows={4}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>特色亮点</Label>
                <Button size="sm" onClick={onAddHighlight}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加亮点
                </Button>
              </div>
              {property.highlights?.map((highlight, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">亮点 {index + 1}</h4>
                    <Button size="sm" variant="outline" onClick={() => onRemoveHighlight(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>标题</Label>
                      {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                        <div key={lang}>
                          <Label className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                          <Input
                            value={highlight.heading[lang as keyof LocalizedString]}
                            onChange={(e) => onUpdateHighlight(index, 'heading', lang as keyof LocalizedString, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>内容</Label>
                      {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                        <div key={lang}>
                          <Label className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                          <Textarea
                            value={highlight.content[lang as keyof LocalizedString]}
                            onChange={(e) => onUpdateHighlight(index, 'content', lang as keyof LocalizedString, e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sqm">面积 (平方米)</Label>
                <Input
                  id="sqm"
                  type="number"
                  value={property.summary.sqm}
                  onChange={(e) => onPropertyChange({
                    summary: { ...property.summary, sqm: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="guests">最大客人数</Label>
                <Input
                  id="guests"
                  type="number"
                  value={property.summary.guests}
                  onChange={(e) => onPropertyChange({
                    summary: { ...property.summary, guests: parseInt(e.target.value) || 1 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">卧室数</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={property.summary.bedrooms}
                  onChange={(e) => onPropertyChange({
                    summary: { ...property.summary, bedrooms: parseInt(e.target.value) || 1 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">浴室数</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={property.summary.bathrooms}
                  onChange={(e) => onPropertyChange({
                    summary: { ...property.summary, bathrooms: parseInt(e.target.value) || 1 }
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pets-allowed"
                  checked={property.summary.petsAllowed}
                  onCheckedChange={(checked) => onPropertyChange({
                    summary: { ...property.summary, petsAllowed: checked }
                  })}
                />
                <Label htmlFor="pets-allowed">允许宠物</Label>
              </div>
            </div>

            <div>
              <Label>卧室配置</Label>
              <p className="text-sm text-gray-500 mb-4">配置每个卧室的床位信息</p>
              {property.bedrooms.map((bedroom, index) => (
                <Card key={index} className="p-4 mb-4">
                  <h4 className="font-medium mb-4">卧室 {index + 1}</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>双人床数量</Label>
                      <Input
                        type="number"
                        value={bedroom.beds.double}
                        onChange={(e) => {
                          const updatedBedrooms = [...property.bedrooms];
                          updatedBedrooms[index] = {
                            ...bedroom,
                            beds: { ...bedroom.beds, double: parseInt(e.target.value) || 0 }
                          };
                          onPropertyChange({ bedrooms: updatedBedrooms });
                        }}
                      />
                    </div>
                    <div>
                      <Label>单人床数量</Label>
                      <Input
                        type="number"
                        value={bedroom.beds.single}
                        onChange={(e) => {
                          const updatedBedrooms = [...property.bedrooms];
                          updatedBedrooms[index] = {
                            ...bedroom,
                            beds: { ...bedroom.beds, single: parseInt(e.target.value) || 0 }
                          };
                          onPropertyChange({ bedrooms: updatedBedrooms });
                        }}
                      />
                    </div>
                    <div>
                      <Label>榻榻米数量</Label>
                      <Input
                        type="number"
                        value={bedroom.beds.tatami}
                        onChange={(e) => {
                          const updatedBedrooms = [...property.bedrooms];
                          updatedBedrooms[index] = {
                            ...bedroom,
                            beds: { ...bedroom.beds, tatami: parseInt(e.target.value) || 0 }
                          };
                          onPropertyChange({ bedrooms: updatedBedrooms });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>卧室图片URL</Label>
                    <Input
                      value={bedroom.image || ''}
                      onChange={(e) => {
                        const updatedBedrooms = [...property.bedrooms];
                        updatedBedrooms[index] = {
                          ...bedroom,
                          image: e.target.value
                        };
                        onPropertyChange({ bedrooms: updatedBedrooms });
                      }}
                      placeholder="/stays/property-name/images/bedroom1.jpg"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            {property.location && (
              <>
                <div>
                  <Label htmlFor="map-embed">地图嵌入代码</Label>
                  <Textarea
                    id="map-embed"
                    value={property.location.mapEmbed}
                    onChange={(e) => onPropertyChange({
                      location: { ...property.location!, mapEmbed: e.target.value }
                    })}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>地区 (多语言)</Label>
                  {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                    <div key={lang}>
                      <Label className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                      <Input
                        value={property.location!.area[lang as keyof LocalizedString]}
                        onChange={(e) => {
                          const updatedLocation = {
                            ...property.location!,
                            area: { ...property.location!.area, [lang]: e.target.value }
                          };
                          onPropertyChange({ location: updatedLocation });
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label>位置描述 (多语言)</Label>
                  {Object.keys(DEFAULT_LOCALIZED_STRING).map((lang) => (
                    <div key={lang}>
                      <Label className="text-sm text-gray-500">{lang.toUpperCase()}</Label>
                      <Textarea
                        value={property.location!.description[lang as keyof LocalizedString]}
                        onChange={(e) => {
                          const updatedLocation = {
                            ...property.location!,
                            description: { ...property.location!.description, [lang]: e.target.value }
                          };
                          onPropertyChange({ location: updatedLocation });
                        }}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}