<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0"
  xmlns:xml="http://www.w3.org/XML/1998/namespace"
  exclude-result-prefixes="xs"
  version="1.0">
  <xsl:output method="xml" indent="yes" encoding="UTF-8" />


  <xsl:variable name="defaultDate">1970-01-01</xsl:variable>
  <xsl:variable name="defaultHref">/akn/nosuchLink/</xsl:variable>
  <xsl:variable name="defaultRefers">/akn/ontology/concept/noConcept</xsl:variable>

  <xsl:param name="meta">
           <identification source="">
         <FRBRWork>
           <FRBRthis value=""/>
           <FRBRuri value=""/>
           <FRBRdate date="{$defaultDate}" name=""/>
           <FRBRauthor href=""/>
           <FRBRcountry value=""/>
         </FRBRWork>
         <FRBRExpression>
           <FRBRthis value=""/>
           <FRBRuri value=""/>
           <FRBRdate date="{$defaultDate}" name=""/>
           <FRBRauthor href=""/>
           <FRBRlanguage language=""/>
         </FRBRExpression>
         <FRBRManifestation>
           <FRBRthis value=""/>
           <FRBRuri value=""/>
           <FRBRdate date="{$defaultDate}" name=""/>
           <FRBRauthor href=""/>
         </FRBRManifestation>
       </identification>
  </xsl:param>

  <xsl:template match="/">
    <akomaNtoso 	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://docs.oasis-open.org/legaldocml/ns/akn/3.0 akomantoso30.xsd">
      <xsl:apply-templates />
    </akomaNtoso>
  </xsl:template>


  <xsl:template match="html | body |  title | head">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="@id">
        <xsl:attribute name="eId"><xsl:value-of select="."/></xsl:attribute>    
  </xsl:template>

  <xsl:template match="@*"></xsl:template>
  <xsl:template match="@pattern">
    <xsl:if test='contains("document ", .)'>
      <xsl:attribute name="name"><xsl:value-of select="."/></xsl:attribute>      
    </xsl:if>
  </xsl:template>
  <xsl:template match="@name">
    <xsl:if test='contains("formula block container ", .)'>
      <xsl:attribute name="name"><xsl:value-of select="."/></xsl:attribute>      
    </xsl:if>    
  </xsl:template>

  <xsl:template match="div">
    <xsl:element name="div">
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>


  <xsl:template match="span">
    <xsl:element name="span">
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="div[@name]">
    <xsl:element name="{./@name}">
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="span[@name]">
    <xsl:element name="{./@name}">
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="div[contains(@class,'generated')] | span[contains(@class,'generated')]"></xsl:template>

  <xsl:template match="div[@pattern='document']">
    <xsl:element name="{./@name}">
      <xsl:apply-templates select="@*"/>
      <meta>
        <xsl:copy-of select="$meta"/>
      </meta>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="*[@ghostedby]">
    <xsl:element name="{./@name}">
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="//*[@ghostid = current()/@ghostedby]/*"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="span[@name='docDate' or @name='date']">
    <xsl:element name="{./@name}">
      <xsl:choose>
        <xsl:when test="@data-date">
           <xsl:attribute name="date"><xsl:value-of select="@data-date"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
           <xsl:attribute name="date"><xsl:value-of select="$defaultDate"/></xsl:attribute>
           <xsl:attribute name="status">incomplete</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="span[@name='role' or @name='person' or @name='location']">
    <xsl:element name="{./@name}">
      <xsl:choose>
        <xsl:when test="@data-refersTo">
           <xsl:attribute name="refersTo"><xsl:value-of select="@data-refersTo"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
           <xsl:attribute name="refersTo"><xsl:value-of select="$defaultRefers"/></xsl:attribute>
           <xsl:attribute name="status">incomplete</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="span[@name='ref'] | a[@name='ref']">
    <xsl:element name="{./@name}">
      <xsl:choose>
        <xsl:when test="@data-href">
           <xsl:attribute name="href"><xsl:value-of select="@data-href"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
           <xsl:attribute name="href"><xsl:value-of select="$defaultHref"/></xsl:attribute>
           <xsl:attribute name="status">incomplete</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
