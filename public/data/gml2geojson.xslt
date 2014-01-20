<xsl:stylesheet version="1.0"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:x="http://www.opengis.net/gml" exclude-result-prefixes="x">
 <xsl:output omit-xml-declaration="yes" indent="yes"/>
 <xsl:strip-space elements="*"/>

    <xsl:template match="x:MultiSurface">
        <MultiGeometry>
            <xsl:apply-templates />
        </MultiGeometry>
    </xsl:template>

    <xsl:template match="x:Polygon">
        <Polygon>
            <xsl:apply-templates />
        </Polygon>
    </xsl:template>

    <xsl:template match="x:Point">
        <Point>
            <xsl:apply-templates />
        </Point>
    </xsl:template>

    <xsl:template match="x:exterior">
    <xsl:if test="preceding-sibling::exterior">,</xsl:if>
    {"ringtype":"exterior",
        <xsl:apply-templates />
    }
    </xsl:template>

    <xsl:template match="x:interior">
    {"ringtype":"interior",
        <xsl:apply-templates />
    },
    </xsl:template>

    <xsl:template match="x:posList">
    "coordinates":[
        <xsl:call-template name="split">
            <xsl:with-param name="str" select="normalize-space(.)" />
        </xsl:call-template>
    ]
    </xsl:template>

    <xsl:template match="x:pos">
        <coordinates>
            <xsl:call-template name="split">
                <xsl:with-param name="str" select="normalize-space(.)" />
            </xsl:call-template>
        </coordinates>
    </xsl:template>

    <xsl:template name="split">
        <xsl:param name="str" />
        <xsl:choose>
            <xsl:when test="contains($str,' ')">
                <xsl:variable name="first">
                    <xsl:value-of select="format-number(number(substring-before($str,' ')),'00.000000')" />
                </xsl:variable>
                <xsl:variable name="second">
                    <xsl:value-of select="format-number(number(substring-before(substring-after(concat($str,' '),' '),' ')),'00.000000')" />
                </xsl:variable>
                <xsl:value-of select="concat('[',$first,',',$second,']')" />

                <xsl:if test="substring-after(substring-after($str,' '),' ')">
                 <xsl:text>, </xsl:text>
                    <xsl:call-template name="split">
                        <xsl:with-param name="str">
                            <xsl:value-of select="substring-after(substring-after($str,' '),' ')"/>
                        </xsl:with-param>
                    </xsl:call-template>
                </xsl:if>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
