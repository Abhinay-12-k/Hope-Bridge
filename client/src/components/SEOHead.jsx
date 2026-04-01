import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function SEOHead({ title, description, image, url }) {
  const siteTitle = "HopeBridge NGO"
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const defaultDesc = "Empowering communities through sustainable health, education, and crisis relief. Join HopeBridge in creating lasting global change."
  const metaDesc = description || defaultDesc
  const siteUrl = "https://hopebridge-ngo.org" // Replace with actual production domain

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url ? `${siteUrl}${url}` : siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url ? `${siteUrl}${url}` : siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={image || `${siteUrl}/og-image.jpg`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url ? `${siteUrl}${url}` : siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={image || `${siteUrl}/og-image.jpg`} />
    </Helmet>
  )
}
