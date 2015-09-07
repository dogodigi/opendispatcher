<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:fn="http://www.w3.org/2005/xpath-functions">
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	
	<xsl:template match="data">
		<html>
			<head>
				<title>Symbolen</title>
			</head>
			<body>
                <h1>Brandweervoorzieningen</h1>
				<table border="1" style="border-collapse: collapse">
					<tbody>
						<tr>
        				    <th>DB ID</th>
							<th>Code</th>
							<th>Naam</th>
							<th>Symbool</th>
							<th>Namespace</th>
							<th>Categorie</th>
							<!--th>Omschrijving</th-->
						</tr>
						<xsl:for-each select="//symbol">
							<xsl:variable name="namespace">
								<xsl:call-template name="namespace2path">
									<xsl:with-param name="namespace" select="namespace"/>
								</xsl:call-template>
							</xsl:variable>
							<xsl:variable name="bgcol">
                                <xsl:call-template name="bgcol"/>
							</xsl:variable>
							<tr>
								<td><xsl:value-of select="gid"/></td>
								<td><xsl:value-of select="type"/></td>
								<td><xsl:value-of select="naam"/></td>
								<td><img alt="{naam}" src="public/images/{$namespace}/{type}.png" height="32px"/></td>
								<td><xsl:value-of select="namespace"/></td>
								<td style="background: #{$bgcol}"><xsl:value-of select="categorie"/></td>
								<!--td><xsl:value-of select="omschrijving"/></td-->
							</tr>
						</xsl:for-each>
					</tbody>
				</table>
				
				<h1>Gevaarlijke stoffen</h1>
				<table border="1" style="border-collapse: collapse">
					<tbody>
						<tr>
        				    <th>DB ID</th>						
							<th>Code</th>
							<th>Naam</th>
							<th>Symbool</th>
							<th>Namespace</th>
							<th>Categorie</th>
							<!--th>Omschrijving</th-->
						</tr>
						<xsl:for-each select="//stof">
							<xsl:variable name="namespace">
								<xsl:call-template name="namespace2path"/>
							</xsl:variable>
							<xsl:variable name="bgcol">
                                <xsl:call-template name="bgcol"/>
							</xsl:variable>
							<tr>
								<td><xsl:value-of select="gid"/></td>
								<td><xsl:value-of select="type"/></td>
								<td><xsl:value-of select="naam"/></td>
								<td><img alt="{naam}" src="public/images/{$namespace}/{type}.png" height="48px"/></td>
								<td><xsl:value-of select="namespace"/></td>
								<td style="background: #{$bgcol}"><xsl:value-of select="categorie"/></td>
								<!--td><xsl:value-of select="omschrijving"/></td-->
							</tr>
						</xsl:for-each>
					</tbody>
				</table>
			</body>
		
		</html>
	</xsl:template>
	
	<xsl:template name="bgcol">
	    <xsl:choose>
		    <xsl:when test="categorie='objectinformatie'">2B941E</xsl:when>
		    <xsl:when test="categorie='preparatief'">558AED</xsl:when>
		    <xsl:when test="categorie='preventief'">F1FA4B</xsl:when>
		    <xsl:when test="categorie='repressief'">E62525</xsl:when>
	    </xsl:choose>
	</xsl:template>
	
	<xsl:template name="namespace2path">
		<xsl:variable name="namespaceLower" select="translate(namespace, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
		<xsl:call-template name="replace">
			<xsl:with-param name="text" select="$namespaceLower"/>
			<xsl:with-param name="replace" select="'-'"/>
			<xsl:with-param name="by" select="''"/>
		</xsl:call-template>	
	</xsl:template>
	
	<xsl:template name="replace">
		<xsl:param name="text" />
		<xsl:param name="replace" />
		<xsl:param name="by" />
		<xsl:choose>
			<xsl:when test="contains($text, $replace)">
				<xsl:value-of select="substring-before($text,$replace)" />
				<xsl:value-of select="$by" />
				<xsl:call-template name="replace">
					<xsl:with-param name="text"	select="substring-after($text,$replace)" />
					<xsl:with-param name="replace" select="$replace" />
					<xsl:with-param name="by" select="$by" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$text" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
</xsl:stylesheet>
