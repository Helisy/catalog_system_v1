const sql = require('mssql')
const sqlConfig = require('../sql_db')

async function getTokenByEcommerce(id)
{
    try
    {
        await sql.connect(sqlConfig)
        const result = await sql.query(`select [AmbarDeliquadros].[dbo].[ECOM_METODOS].TOKEN_TEMP AS TOKEN, [AmbarDeliquadros].[dbo].[ECOM_ORIGEM].ORIGEM_NOME, [AmbarDeliquadros].[dbo].[ECOM_ORIGEM].ORIGEM_ID FROM [AmbarDeliquadros].[dbo].ECOM_METODOS
        join [AmbarDeliquadros].[dbo].[ECOM_ORIGEM] on [AmbarDeliquadros].[dbo].[ECOM_METODOS].ORIGEM = [AmbarDeliquadros].[dbo].[ECOM_ORIGEM].ORIGEM_ID
        where [AmbarDeliquadros].[dbo].[ECOM_METODOS].ECOM_ID = '2' and [AmbarDeliquadros].[dbo].[ECOM_METODOS].ORIGEM = '${id}';`);

        return result.recordsets[0];
    } catch (err) {
        console.log("Error on getTokenByEcommerce(id)")
        throw(err)
    }
}

module.exports = { getTokenByEcommerce };