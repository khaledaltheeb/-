type Props={latitude:number|null;longitude:number|null;label:string;address?:string|null};

export default function LocationMap({latitude,longitude,label,address}:Props){
 if(latitude===null||longitude===null||!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude<-90||latitude>90||longitude<-180||longitude>180)return null;
 const lat=Number(latitude),lon=Number(longitude),delta=.012;
 const bbox=[Math.max(-180,lon-delta),Math.max(-90,lat-delta),Math.min(180,lon+delta),Math.min(90,lat+delta)].join(',');
 const embed=`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
 const open=`https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lon))}#map=16/${encodeURIComponent(String(lat))}/${encodeURIComponent(String(lon))}`;
 return <section className="location-map" aria-labelledby="location-map-title"><div className="location-map-head"><div><span className="eyebrow">الموقع</span><h2 id="location-map-title">{label} على الخريطة</h2>{address&&<p>{address}</p>}</div><a className="button" href={open} target="_blank" rel="noopener noreferrer">فتح خريطة أكبر</a></div><div className="location-map-frame"><iframe title={`موقع ${label} على الخريطة`} src={embed} loading="lazy" referrerPolicy="no-referrer"/></div><small>الخريطة تظهر فقط عندما يسمح صاحب الملف بعرض الموقع العام.</small></section>;
}
