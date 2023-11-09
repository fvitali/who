<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:h="http://www.w3.org/1999/xhtml"
  xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0"
  xmlns:xml="http://www.w3.org/XML/1998/namespace"
  exclude-result-prefixes="xs akn h"
  version="1.0">
  <xsl:param name="additionalClasses">none</xsl:param>
  <xsl:param name="docPrefix"></xsl:param>
  <xsl:output omit-xml-declaration="yes" method="html" encoding="UTF-8"  indent="yes"/>
  <xsl:namespace-alias stylesheet-prefix="h" result-prefix=""/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
      <xsl:apply-templates/>
  </xsl:template>

	<xsl:template match="*">
		<xsl:variable name="ln">
			<xsl:text> </xsl:text>
			<xsl:value-of select="local-name()"/>
			<xsl:text>,</xsl:text>
		</xsl:variable>

		<xsl:variable name="root">
         akomaNtoso, akomantoso,
		</xsl:variable>

		<xsl:variable name="doctype">
		 act, amendment, amendmentList, bill, debate,
		 debateReport, doc, documentCollection, judgment, officialGazette,
		 portion, statement,
		</xsl:variable>

		<xsl:variable name="container">
		 address, adjournment, administrationOfOath, amendmentBody, amendmentContent,
		 amendmentHeading, amendmentJustification, amendmentReference,
		 answer, arguments, attachments, attachment, background, body,
		 citations, collectionBody, communication, component, components,
		 conclusions, container, court, coverPage, debateBody,
		 debateSection, decision, declarationOfVote, div, formula, header,
		 interstitial, introduction, judgmentBody, longTitle,
		 mainBody, ministerialStatements, motivation, narrative,
		 nationalInterest, noticesOfMotion, oralStatements, other,
		 papers, personalStatements, petitions, pointOfOrder, prayers,
		 preamble, preface, proceduralMotions, question, questions,
		 recitals, remedies, resolutions, rollCall, scene,
		 speech, speechGroup, summary, tocItem,
		 writtenStatements, intro, wrapUp, 
		</xsl:variable>

		<xsl:variable name="hcontainer">
		 alinea, annex, appendix, article, blockList,
		 book, chapter, clause, crossHeading, division,
		 hcontainer, indent, level, list, mediaContainer,
		 noteSection, paragraph, part, point, proviso,
		 regulation, rule, schedule, section, subchapter,
		 subclause, subdivision, sublist, subparagraph, subpart,
		 subrule, subschedule, subsection, subtitle, title,
		 tome, transitional,
		</xsl:variable>

		<xsl:variable name="block">
		 block, blockContainer, foreign, listIntroduction, 
		 p, tblock, toc, 
		</xsl:variable>

		<xsl:variable name="inline">
		 a, abbr, affectedDocument, argument, b,
		 change, concept, courtType, date, decoration,
		 def, defBody, del, docAuthority, docCommittee,
		 docDate, docIntroducer, docJurisdiction, docketNumber, docNumber,
		 docProponent, docPurpose, docStage, docStatus, docTitle,
		 docType, embeddedStructure, embeddedText, entity, event,
		 fillIn, foreignText, from, i, inline,
		 ins, judge, lawyer, legislature, location,
		 mmod, mod, mref, neutralCitation, object,
		 omissis, opinion, organization, outcome, party,
		 person, placeholder, process, quantity, quotedText,
		 recordedTime, ref, relatedDocument, remark, rmod,
		 role, rref, session, shortTitle, signature,
		 span, sub, sup, term, time,
		 tocHeading, tocNum, tocPointer, u, vote,
		</xsl:variable>
		<xsl:variable name="listItem">
		 citation, item, recital,
		</xsl:variable>

		<xsl:variable name="marker">
		 img, marker, noteRef,
		</xsl:variable>

		<xsl:variable name="lineBreak">
		 br, eol,
		</xsl:variable>

		<xsl:variable name="pageBreak">
		 eop,
		</xsl:variable>

		<xsl:variable name="subflow">
		 quotedStructure, subFlow,
		</xsl:variable>

		<xsl:variable name="authorialNote">
		 authorialNote,
		</xsl:variable>

		<xsl:variable name="special">
		 content, componentRef, documentRef,
		 </xsl:variable>

		<xsl:variable name="html">
		 ul, ol, li, table, tr, td, th, caption,
		 colgroup, col, thead, tbody, tfoot,
		 </xsl:variable>

		<xsl:variable name="meta">
	      meta,
		</xsl:variable>

		 <xsl:variable name="headings">
		 heading, subheading,
		 </xsl:variable>

	  <xsl:variable name="outer">
		 num
		 </xsl:variable>

	<xsl:choose>
		<xsl:when test="contains($root,$ln)">
			<div class="canvas">
				<xsl:apply-templates />
			</div>
		</xsl:when>
		<xsl:when test="contains($doctype,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">document</xsl:with-param>
				<xsl:with-param name="additionalClass" select="$additionalClasses"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($container,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">container</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($hcontainer,$ln)">
			<xsl:call-template name="hcontainer">
				<xsl:with-param name="pattern">hcontainer</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($block,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">block</xsl:with-param>
				<xsl:with-param name="tag">div</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($listItem,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">listItem</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($inline,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">inline</xsl:with-param>
				<xsl:with-param name="tag">span</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($marker,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">marker</xsl:with-param>
				<xsl:with-param name="tag">span</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($lineBreak,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">lineBreak</xsl:with-param>
				<xsl:with-param name="tag">span</xsl:with-param>
			</xsl:call-template>
	        <span class="eol"/>
		</xsl:when>
		<xsl:when test="contains($pageBreak,$ln)">
	        <span class="eop"/>
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">lineBreak</xsl:with-param>
				<xsl:with-param name="tag">span</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($subflow,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">subflow</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($authorialNote,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">subflow</xsl:with-param>
				<xsl:with-param name="tag">span</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($special,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern"><xsl:value-of select="local-name()"/></xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($html,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern"><xsl:value-of select="local-name()"/></xsl:with-param>
				<xsl:with-param name="tag"><xsl:value-of select="local-name()"/></xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($headings,$ln)">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern"><xsl:value-of select="local-name()"/></xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:when test="contains($outer,$ln)"/>
	  
		<xsl:when test="contains($meta,$ln)">
			<xsl:call-template name="meta">
				<xsl:with-param name="pattern">metaContainer</xsl:with-param>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:call-template name="element">
				<xsl:with-param name="pattern">unknown</xsl:with-param>
			</xsl:call-template>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

	<xsl:template match="*" mode="outer">
			<xsl:call-template name="element">
				<xsl:with-param name="pattern"><xsl:value-of select="local-name()"/></xsl:with-param>
    	</xsl:call-template>
	</xsl:template>
	<xsl:template match="akn:num"/>

	<xsl:template match="*" mode="meta">
		<xsl:call-template name="meta">
			<xsl:with-param name="pattern">meta</xsl:with-param>
		</xsl:call-template>
	</xsl:template>
  <!-- ======================================================== -->
  <!--                                                          -->
  <!--                   MAIN TEMPLATE                          -->
  <!--                                                          -->
  <!-- ======================================================== -->

  <xsl:template name="hcontainer">
    <xsl:param name="pattern"/>
    <xsl:param name="additionalClass"/>
    <xsl:param name="additionalContent"/>
    <xsl:param name="special"/>
      <xsl:if test="contains($special,'addBRBefore')">
        <br/>
      </xsl:if>
    <div>
      <xsl:if test="@eId">
        <xsl:attribute name="id"><xsl:value-of select="$docPrefix"/><xsl:value-of select="@eId"/></xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:value-of select="$pattern"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$additionalClass"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="local-name()"/>
      </xsl:attribute>
      <xsl:attribute name="pattern"><xsl:value-of select="$pattern"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="local-name()"/></xsl:attribute>
      <xsl:apply-templates select="@*"/>
	  <xsl:apply-templates select="akn:num" mode="outer"/>
	    <div class="wrapper">
	      <xsl:apply-templates select="*"/>
	  </div>
	  <xsl:apply-templates select="akn:wrapUp" mode="outer"/>
    </div>
  </xsl:template>

  <xsl:template name="element">
    <xsl:param name="pattern"/>
    <xsl:param name="tag">div</xsl:param>
    <xsl:param name="additionalClass"/>
    <xsl:param name="additionalContent"/>
    <xsl:param name="special"/>
      <xsl:if test="contains($special,'addBRBefore')">
        <br/>
      </xsl:if>
    <xsl:element name="{$tag}">
      <xsl:if test="@eId">
        <xsl:attribute name="id"><xsl:value-of select="$docPrefix"/><xsl:value-of select="@eId"/></xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:value-of select="$pattern"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$additionalClass"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="local-name()"/>
      </xsl:attribute>
      <xsl:attribute name="pattern"><xsl:value-of select="$pattern"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="local-name()"/></xsl:attribute>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>


 <xsl:template name="meta">
    <xsl:param name="pattern"/>
    <div>
      <xsl:if test="@eId">
        <xsl:attribute name="id"><xsl:value-of select="@eId"/></xsl:attribute>
      </xsl:if>
      <xsl:attribute name="class">
        <xsl:value-of select="$pattern"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="local-name()"/>
      </xsl:attribute>
      <xsl:attribute name="pattern"><xsl:value-of select="$pattern"/></xsl:attribute>
      <xsl:attribute name="name"><xsl:value-of select="local-name()"/></xsl:attribute>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates mode="meta"/>
    </div>
</xsl:template>
  
	<xsl:template match="@refersTo" priority="10">
	  <xsl:variable name="location"><xsl:value-of select="substring(current(),2)"/></xsl:variable>
	  <xsl:attribute name="data-refersTo"><xsl:value-of select="//*[@eId=$location]/@href"/></xsl:attribute>
	</xsl:template>  
	  
	<xsl:template match="@eId"/>
	<xsl:template match="@*">
		<xsl:attribute name="data-{local-name()}"><xsl:value-of select="."/></xsl:attribute>
	</xsl:template>

</xsl:stylesheet>
