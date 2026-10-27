import React, { useState } from 'react';
import type { EventInfo, Facility, FaqItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import styles from './InfoView.module.css';
import {
  MapPin,
  Calendar,
  ExternalLink,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Award,
  Navigation,
  Info,
  Coffee,
  Trash2,
  Baby
} from 'lucide-react';

interface InfoViewProps {
  eventInfo: EventInfo;
  facilities: Facility[];
  faqs: FaqItem[];
  onShowFacilityOnMap?: (facilityId: string) => void;
}

export const InfoView: React.FC<InfoViewProps> = ({
  eventInfo,
  facilities,
  faqs,
  onShowFacilityOnMap
}) => {
  const { lang, t } = useLanguage();
  const isJa = lang === 'ja';

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const renderFacilityIcon = (type: Facility['type']) => {
    switch (type) {
      case 'entrance':
        return <Navigation size={14} />;
      case 'info':
        return <Info size={14} />;
      case 'firstaid':
        return <ShieldAlert size={14} />;
      case 'toilet':
        return <span style={{ fontSize: '10px', fontWeight: 'bold' }}>WC</span>;
      case 'food_court':
        return <Coffee size={14} />;
      case 'trash':
        return <Trash2 size={14} />;
      case 'nursing':
        return <Baby size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    isJa ? `${eventInfo.venueJa} ${eventInfo.addressJa}` : `${eventInfo.venueEn} ${eventInfo.addressEn}`
  )}`;

  return (
    <div className={styles.container}>
      {/* 公式ロゴ & イベント概要バナー */}
      {eventInfo.logoUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#ffffff',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px'
          }}
        >
          <img
            src={eventInfo.logoUrl}
            alt="JCAF Logo"
            style={{
              width: '84px',
              height: '84px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #f1f5f9',
              flexShrink: 0
            }}
          />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 6px' }}>
              {isJa ? eventInfo.nameJa : eventInfo.nameEn}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.45' }}>
              {isJa ? eventInfo.taglineJa : eventInfo.taglineEn}
            </p>
          </div>
        </div>
      )}

      {/* イベント概要 & 開催情報 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper}>
            <Calendar size={18} />
          </div>
          <h2 className={styles.sectionTitle}>
            {isJa ? '開催概要' : 'Festival Overview'}
          </h2>
        </div>

        <div className={styles.accessRow}>
          <div className={styles.accessItem}>
            <strong>{isJa ? '日程' : 'Dates'}:</strong>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {isJa ? eventInfo.datesJa : eventInfo.datesEn}
            </span>
          </div>
          <div className={styles.accessItem}>
            <strong>{isJa ? '時間' : 'Hours'}:</strong>
            <span style={{ fontWeight: 700 }}>
              {isJa ? eventInfo.hoursJa : eventInfo.hoursEn}
            </span>
          </div>
          <div className={styles.accessItem}>
            <strong>{isJa ? '会場' : 'Venue'}:</strong>
            <span>
              <strong>{isJa ? eventInfo.venueJa : eventInfo.venueEn}</strong>
              <br />
              <small style={{ color: '#64748b' }}>
                {isJa ? eventInfo.addressJa : eventInfo.addressEn}
              </small>
            </span>
          </div>
          <div className={styles.accessItem}>
            <strong>{isJa ? '入場料' : 'Admission'}:</strong>
            <span>{isJa ? eventInfo.admissionJa : eventInfo.admissionEn}</span>
          </div>
          <div className={styles.accessItem}>
            <strong>{isJa ? '運営' : 'Organiser'}:</strong>
            <span>{isJa ? eventInfo.organizerJa : eventInfo.organizerEn}</span>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '14px', fontSize: '0.82rem' }}
        >
          <MapPin size={15} />
          <span>{t('info.open_google_maps')} (Collingwood Town Hall)</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* 施設案内 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper}>
            <Navigation size={18} />
          </div>
          <h2 className={styles.sectionTitle}>{t('info.facilities_title')}</h2>
        </div>

        <div className={styles.facilityGrid}>
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className={styles.facilityItem}
              style={{ cursor: onShowFacilityOnMap ? 'pointer' : 'default' }}
              onClick={() => onShowFacilityOnMap && onShowFacilityOnMap(fac.id)}
            >
              <div className={styles.facilityItemIcon}>
                {renderFacilityIcon(fac.type)}
              </div>
              <div className={styles.facilityItemContent}>
                <div className={styles.facilityItemName}>
                  {isJa ? fac.nameJa : fac.nameEn}
                </div>
                <div className={styles.facilityItemDesc}>
                  {isJa ? fac.descJa : fac.descEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ご来場のマナーとお願い */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper} style={{ color: 'var(--color-accent)' }}>
            <ShieldAlert size={18} />
          </div>
          <h2 className={styles.sectionTitle}>{t('info.rules_title')}</h2>
        </div>

        <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', lineHeight: '1.7', color: 'var(--color-text-main)' }}>
          {isJa ? (
            <>
              <li><strong>ゴミの分別回収:</strong> 会場内の指定のゴミ箱に、一般ごみとリサイクルごみを分別して捨ててください。</li>
              <li><strong>飲酒・喫煙:</strong> 会場内では固く禁じます。飲酒・喫煙をされている方がいた場合は、スタッフよりお声がけし、ご退場いただきます。</li>
              <li><strong>写真・動画撮影:</strong> イベントの様子は、撮影スタッフ札を首から下げた専任のスタッフが撮影をします。映り込みを希望されない方は撮影スタッフにお声がけください。</li>
              <li><strong>救護・体調管理:</strong> 気分が悪くなったり、怪我をされた場合は、ファーストエイドまたは最寄りのスタッフへお声がけください。</li>
            </>
          ) : (
            <>
              <li><strong>Waste & Recycling:</strong> Please separate general waste and recyclables into designated bins across the venue.</li>
              <li><strong>Alcohol & Smoking:</strong> Strictly prohibited on festival grounds. Anyone found consuming alcohol or smoking will be escorted off the premises.</li>
              <li><strong>Photography & Filming:</strong> Dedicated festival staff wearing official photographer badges will be documenting the event. If you prefer not to be photographed or filmed, please let our photography team know.</li>
              <li><strong>First Aid & Wellbeing:</strong> If you feel unwell or sustain an injury, please visit the First Aid station or speak to any staff member immediately.</li>
            </>
          )}
        </ul>
      </div>

      {/* よくある質問 (FAQ) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper}>
            <HelpCircle size={18} />
          </div>
          <h2 className={styles.sectionTitle}>{t('info.faq_title')}</h2>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>Q. {isJa ? faq.questionJa : faq.questionEn}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer}>
                    {isJa ? faq.answerJa : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 主催者 JCAF について */}
      <div className={styles.jcafBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Award size={20} style={{ color: 'var(--color-gold)' }} />
          <h3 className={styles.jcafBannerTitle}>
            {isJa ? eventInfo.organizerJa : eventInfo.organizerEn}
          </h3>
        </div>
        <p className={styles.jcafBannerText}>
          {isJa
            ? '日本文化芸術祭実行委員会（JCAF Committee）は、メルボルンにおける日本文化・芸術の振興と交流を目的に設立された非営利法人 Japan Culture and Art Foundation Inc (JCAF Inc)が主導する、有志ボランティアチームです。明るく、楽しく、誰もが参加できるイベント・コミュニティ作りを目指しています。'
            : 'The Japan Culture and Art Festival Committee (JCAF Committee) is a dedicated volunteer team led by Japan Culture and Art Foundation Inc (JCAF Inc), a non-profit organisation established to promote and foster Japanese culture and arts in Melbourne. We aim to create cheerful, fun, and inclusive events and community spaces where everyone can participate and connect.'}
        </p>
      </div>
    </div>
  );
};
