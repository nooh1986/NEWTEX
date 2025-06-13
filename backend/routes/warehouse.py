from flask import Blueprint, jsonify, request, current_app
from sqlalchemy import text
from flask_sqlalchemy import SQLAlchemy

warehouse_bp = Blueprint('warehouse', __name__)

@warehouse_bp.route('/scrap', methods=['GET'])
def get_scrap_warehouse():
    """Get scrap warehouse data using your working SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Your working query
        sql_query = text("SELECT Desan , COUNT(*) as Desan_Count , Format(SUM(Long2) , 'N1') AS TotalLong FROM Main WHERE Status = 'سقط' GROUP BY Desan ORDER BY Desan DESC")
        
        # Execute the query
        result = db.session.execute(sql_query)
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        products = []
        for row in rows:
            product = {
                'desan': row[0] if row[0] else '',
                'desan_count': row[1] if len(row) > 1 else 0,
                'total_long': row[2] if len(row) > 2 else '0.0'
            }
            products.append(product)
        
        return jsonify({
            'success': True,
            'data': products,
            'warehouse_type': 'scrap',
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/classic', methods=['GET'])
def get_classic_warehouse():
    """Get classic warehouse data using your working SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Your working query for classic warehouse
        sql_query = text("SELECT Desan , COUNT(*) as Desan_Count , Format(SUM(Long2) , 'N1') AS TotalLong FROM Main WHERE Status = 'مستودع' AND Customer = '6000' GROUP BY Desan ORDER BY Desan DESC")
        
        # Execute the query
        result = db.session.execute(sql_query)
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        products = []
        for row in rows:
            product = {
                'desan': row[0] if row[0] else '',
                'desan_count': row[1] if len(row) > 1 else 0,
                'total_long': row[2] if len(row) > 2 else '0.0'
            }
            products.append(product)
        
        return jsonify({
            'success': True,
            'data': products,
            'warehouse_type': 'classic',
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/chinese', methods=['GET'])
def get_chinese_warehouse():
    """Get Chinese warehouse data using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Updated query to include both count and total length
        sql_query = text("SELECT Type, COUNT(*) as Type_Count, Format(SUM(Long), 'N1') AS TotalLong FROM Chines WHERE Status = 'مستودع' GROUP BY Type ORDER BY Type")
        
        # Execute the query
        result = db.session.execute(sql_query)
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        products = []
        for row in rows:
            product = {
                'type': row[0] if row[0] else '',
                'count': row[1] if len(row) > 1 else 0,
                'total_long': row[2] if len(row) > 2 else '0.0'
            }
            products.append(product)
        
        return jsonify({
            'success': True,
            'data': products,
            'warehouse_type': 'chinese',
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/summary', methods=['GET'])
def get_warehouse_summary():
    """Get summary statistics for all warehouse types"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Get scrap warehouse summary
        scrap_query = text("SELECT COUNT(DISTINCT Desan) as unique_desans, SUM(Long2) as total_length FROM Main WHERE Status = 'سقط'")
        scrap_result = db.session.execute(scrap_query)
        scrap_row = scrap_result.fetchone()
        
        # Get classic warehouse summary
        classic_query = text("SELECT COUNT(DISTINCT Desan) as unique_desans, SUM(Long2) as total_length FROM Main WHERE Status = 'مستودع'")
        classic_result = db.session.execute(classic_query)
        classic_row = classic_result.fetchone()
        
        # Get Chinese warehouse summary
        chinese_query = text("SELECT COUNT(DISTINCT Type) as unique_types, COUNT(*) as total_pieces FROM Chines WHERE Status = 'مستودع'")
        chinese_result = db.session.execute(chinese_query)
        chinese_row = chinese_result.fetchone()
        
        summary = {
            'scrap': {
                'unique_desans': scrap_row[0] if scrap_row and scrap_row[0] else 0,
                'total_length': float(scrap_row[1]) if scrap_row and scrap_row[1] else 0.0
            },
            'classic': {
                'unique_desans': classic_row[0] if classic_row and classic_row[0] else 0,
                'total_length': float(classic_row[1]) if classic_row and classic_row[1] else 0.0
            },
            'chinese': {
                'unique_types': chinese_row[0] if chinese_row and chinese_row[0] else 0,
                'total_pieces': chinese_row[1] if chinese_row and chinese_row[1] else 0
            }
        }
        
        return jsonify({
            'success': True,
            'data': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/summary', methods=['GET'])
def get_sales_summary():
    """Get sales summary with support for different time periods"""
    try:
        db = current_app.extensions['sqlalchemy']
        period = request.args.get('period', 'last_month')        # Define date ranges based on period
        from datetime import datetime, timedelta
        
        if period == 'yesterday':
            start_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            end_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        elif period == 'last_week' or period == 'week':
            start_date = (datetime.now() - timedelta(weeks=1)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_month' or period == 'month':
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_3_months':
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        else:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        print(f"Sales Summary - Period: {period}, Start: {start_date}, End: {end_date}")
        
        # Debug: Check total records in date range without filters
        debug_query = text("""
            SELECT COUNT(*) as total_records
            FROM Main 
            WHERE Date >= :start_date 
            AND Date <= :end_date
        """)
        debug_result = db.session.execute(debug_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        debug_row = debug_result.fetchone()
        print(f"Total records in date range: {debug_row[0] if debug_row else 0}")
        
        # Debug: Check records with status filter
        debug_status_query = text("""
            SELECT COUNT(*) as total_records
            FROM Main 
            WHERE Date >= :start_date 
            AND Date <= :end_date
            AND Status = 'مشحون'
        """)
        debug_status_result = db.session.execute(debug_status_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        debug_status_row = debug_status_result.fetchone()
        print(f"Records with Status='مشحون': {debug_status_row[0] if debug_status_row else 0}")
          # Main (Classic) sales summary
        main_query = text("""
            SELECT 
                COUNT(*) as total_pieces,
                SUM(Long2) as total_meters,
                COUNT(DISTINCT customerNumber) as unique_customers,
                COUNT(DISTINCT Desan) as unique_products
            FROM Main 
            WHERE Status = 'مشحون' 
            AND Date3 >= :start_date 
            AND Date3 <= :end_date
            AND customerNumber != '6000'
        """)
        
        main_result = db.session.execute(main_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        main_row = main_result.fetchone()
        
        print(f"Main query result: {main_row}")
        
        # Chinese sales summary
        chinese_query = text("""
            SELECT 
                COUNT(*) as total_pieces,
                SUM(Long) as total_meters,
                COUNT(DISTINCT Type) as unique_types,
                COUNT(DISTINCT Color) as unique_colors
            FROM Chines 
            WHERE Status = 'مشحون' 
            AND Date >= :start_date 
            AND Date <= :end_date
        """)
        
        chinese_result = db.session.execute(chinese_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        chinese_row = chinese_result.fetchone()
        
        # Process results
        main_data = {
            'total_pieces': main_row[0] if main_row and main_row[0] else 0,
            'total_meters': float(main_row[1]) if main_row and main_row[1] else 0.0,
            'unique_customers': main_row[2] if main_row and main_row[2] else 0,
            'unique_products': main_row[3] if main_row and main_row[3] else 0
        }
        
        chinese_data = {
            'total_pieces': chinese_row[0] if chinese_row and chinese_row[0] else 0,
            'total_meters': float(chinese_row[1]) if chinese_row and chinese_row[1] else 0.0,
            'unique_types': chinese_row[2] if chinese_row and chinese_row[2] else 0,
            'unique_colors': chinese_row[3] if chinese_row and chinese_row[3] else 0
        }
        
        combined_data = {
            'total_pieces': main_data['total_pieces'] + chinese_data['total_pieces'],
            'total_meters': main_data['total_meters'] + chinese_data['total_meters']
        }
        
        return jsonify({
            'success': True,
            'data': {
                'main': main_data,
                'chinese': chinese_data,
                'combined': combined_data
            },
            'period': period,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/main', methods=['GET'])
def get_main_sales():
    """Get main sales data with period support"""
    try:
        db = current_app.extensions['sqlalchemy']
        period = request.args.get('period', 'last_month')
        
        # Define date ranges (same logic as summary)
        from datetime import datetime, timedelta
        
        if period == 'yesterday':
            start_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            end_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        elif period == 'last_week' or period == 'week':
            start_date = (datetime.now() - timedelta(weeks=1)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_month' or period == 'month':
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_3_months':
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        else:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Monthly breakdown for charts
        monthly_query = text("""
            SELECT 
                FORMAT(Date, 'yyyy-MM') as period,
                COUNT(*) as total_pieces,
                SUM(Long2) as total_meters
            FROM Main 
            WHERE Status = 'مشحون' 
            AND Date >= :start_date 
            AND Date <= :end_date
            AND Customer != '6000'
            GROUP BY FORMAT(Date, 'yyyy-MM')
            ORDER BY period DESC
        """)
        
        result = db.session.execute(monthly_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        rows = result.fetchall()
        
        data = []
        for row in rows:
            data.append({
                'period': row[0] if row[0] else '',
                'total_pieces': row[1] if row[1] else 0,
                'total_meters': float(row[2]) if row[2] else 0.0
            })
        
        return jsonify({
            'success': True,
            'data': data,
            'period': period
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/chinese', methods=['GET'])
def get_chinese_sales():
    """Get Chinese sales data with period support"""
    try:
        db = current_app.extensions['sqlalchemy']
        period = request.args.get('period', 'last_month')
        
        # Define date ranges (same logic as summary)
        from datetime import datetime, timedelta
        
        if period == 'yesterday':
            start_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            end_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        elif period == 'last_week' or period == 'week':
            start_date = (datetime.now() - timedelta(weeks=1)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_month' or period == 'month':
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif period == 'last_3_months':
            start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        else:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Monthly breakdown for charts
        monthly_query = text("""
            SELECT 
                FORMAT(Date, 'yyyy-MM') as period,
                COUNT(*) as total_pieces,
                SUM(Long) as total_meters
            FROM Chines 
            WHERE Status = 'مشحون' 
            AND Date >= :start_date 
            AND Date <= :end_date
            GROUP BY FORMAT(Date, 'yyyy-MM')
            ORDER BY period DESC
        """)
        
        result = db.session.execute(monthly_query, {
            'start_date': start_date, 
            'end_date': end_date
        })
        rows = result.fetchall()
        
        data = []
        for row in rows:
            data.append({
                'period': row[0] if row[0] else '',
                'total_pieces': row[1] if row[1] else 0,
                'total_meters': float(row[2]) if row[2] else 0.0
            })
        
        return jsonify({
            'success': True,
            'data': data,
            'period': period
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/top-products', methods=['GET'])
def get_top_products():
    """Get top selling products from both tables with type filtering"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        limit = request.args.get('limit', 10, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        table_type = request.args.get('type', 'both')
        
        results = {}
        
        if table_type in ['main', 'both']:
            # Build where clause for Main table
            main_where = "WHERE Status = 'مشحون'"
            main_params = {}
            
            if start_date:
                main_where += " AND Date3 >= :start_date"
                main_params['start_date'] = start_date
            if end_date:
                main_where += " AND Date3 <= :end_date"
                main_params['end_date'] = end_date
            
            # Top Main products
            main_query = text(f"""
                SELECT TOP {limit}
                    Desan,
                    COUNT(*) as total_pieces,
                    SUM(Long2) as total_meters,
                    COUNT(DISTINCT Customer) as unique_customers
                FROM Main {main_where}
                GROUP BY Desan
                ORDER BY COUNT(*) DESC
            """)
            
            main_result = db.session.execute(main_query, main_params)
            main_rows = main_result.fetchall()
            
            # Convert results
            main_products = []
            main_total = sum(row[1] for row in main_rows) if main_rows else 1
            
            for row in main_rows:
                pieces = row[1] if len(row) > 1 else 0
                main_products.append({
                    'name': row[0] if row[0] else '',
                    'total_pieces': pieces,
                    'total_meters': float(row[2]) if len(row) > 2 and row[2] else 0.0,
                    'unique_customers': row[3] if len(row) > 3 else 0,
                    'percentage': round((pieces / main_total) * 100, 1) if main_total > 0 else 0,
                    'table': 'main'
                })
            
            results['main'] = main_products
        
        if table_type in ['chinese', 'both']:
            # Build where clause for Chinese table
            chinese_where = "WHERE Status = 'مشحون'"
            chinese_params = {}
            
            if start_date:
                chinese_where += " AND Date >= :start_date"
                chinese_params['start_date'] = start_date
            if end_date:
                chinese_where += " AND Date <= :end_date"
                chinese_params['end_date'] = end_date
            
            # Top Chinese products with Type and Color
            chinese_query = text(f"""
                SELECT TOP {limit}
                    Type,
                    Color,
                    COUNT(*) as total_pieces,
                    SUM(Long) as total_meters,
                    COUNT(DISTINCT Customer) as unique_customers
                FROM Chines {chinese_where}
                GROUP BY Type, Color
                ORDER BY COUNT(*) DESC
            """)
            
            chinese_result = db.session.execute(chinese_query, chinese_params)
            chinese_rows = chinese_result.fetchall()
            
            # Convert results
            chinese_products = []
            chinese_total = sum(row[2] for row in chinese_rows) if chinese_rows else 1
            
            for row in chinese_rows:
                pieces = row[2] if len(row) > 2 else 0
                chinese_products.append({
                    'type': row[0] if row[0] else '',
                    'color': row[1] if len(row) > 1 and row[1] else '',
                    'total_pieces': pieces,
                    'total_meters': float(row[3]) if len(row) > 3 and row[3] else 0.0,
                    'unique_customers': row[4] if len(row) > 4 else 0,
                    'percentage': round((pieces / chinese_total) * 100, 1) if chinese_total > 0 else 0,
                    'table': 'chinese'
                })
            
            results['chinese'] = chinese_products
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/chinese/customers', methods=['GET'])
def get_chinese_customer_sales():
    """Get Chinese sales grouped by customer for analysis"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        limit = request.args.get('limit', 10, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')
        
        # Build where clause
        where_clause = "WHERE Status = 'مشحون'"
        params = {}
        
        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND CONVERT(date, Date) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'last_week' or period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(week, -1, GETDATE()) AND Date < GETDATE()"
        elif period == 'last_month' or period == 'month':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -1, GETDATE()) AND Date < GETDATE()"
        elif period == 'last_3_months':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -3, GETDATE()) AND Date < GETDATE()"
        else:
            # Use traditional date filters
            if start_date:
                where_clause += " AND Date >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date <= :end_date"
                params['end_date'] = end_date
          # Query for customer sales analysis
        sql_query = text(f"""
            SELECT TOP {limit}
                Customer,
                COUNT(*) as total_pieces,
                SUM(Long) as total_meters,
                COUNT(DISTINCT CONCAT(Type, '-', Color)) as unique_products
            FROM Chines {where_clause}
            GROUP BY Customer
            ORDER BY SUM(Long) DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert results
        customers = []
        
        for row in rows:
            customers.append({
                'customer': row[0] if row[0] else 'غير محدد',
                'total_pieces': row[1] if len(row) > 1 else 0,
                'total_meters': float(row[2]) if len(row) > 2 and row[2] else 0.0,
                'unique_products': row[3] if len(row) > 3 else 0
            })
        
        return jsonify({
            'success': True,
            'data': customers,
            'count': len(customers)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/chinese/detailed', methods=['GET'])
def get_chinese_sales_detailed():
    """Get detailed Chinese sales data with all fields as requested"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')
        limit = request.args.get('limit', 1000, type=int)
          # Build where clause for filtering
        where_clause = "WHERE Status = 'مشحون'"
        params = {}
        
        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND CONVERT(date, Date) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(week, -1, GETDATE()) AND Date < GETDATE()"
        elif period == 'month':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -1, GETDATE()) AND Date < GETDATE()"
        else:
            # Use traditional date filters
            if start_date:
                where_clause += " AND Date >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date <= :end_date"
                params['end_date'] = end_date
        
        # Your exact query structure with additional filtering
        sql_query = text(f"""
            SELECT TOP {limit}
                Number, Type, Color, Long, Customer, Date 
            FROM Chines 
            {where_clause}
            ORDER BY Date DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        sales_data = []
        for row in rows:
            sales_data.append({
                'number': row[0] if row[0] else '',
                'type': row[1] if len(row) > 1 and row[1] else '',
                'color': row[2] if len(row) > 2 and row[2] else '',
                'length': float(row[3]) if len(row) > 3 and row[3] else 0.0,
                'customer': row[4] if len(row) > 4 and row[4] else '',
                'date': row[5].strftime('%Y-%m-%d') if len(row) > 5 and row[5] else ''
            })
        
        return jsonify({
            'success': True,
            'data': sales_data,
            'count': len(sales_data),
            'query_used': 'SELECT Number, Type, Color, Long, Customer, Date FROM Chines WHERE Status = "مشحون"'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/chinese/top-products', methods=['GET'])
def get_chinese_top_products():
    """Get top Chinese products with Type and Color breakdown"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        limit = request.args.get('limit', 10, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')
          # Build where clause
        where_clause = "WHERE Status = 'مشحون'"
        params = {}        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND CONVERT(date, Date) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'last_week' or period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(week, -1, GETDATE()) AND Date < GETDATE()"
        elif period == 'last_month' or period == 'month':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -1, GETDATE()) AND Date < GETDATE()"
        elif period == 'last_3_months':
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -3, GETDATE()) AND Date < GETDATE()"
            # Filter for last month data (30 days)
            where_clause = "WHERE Status = 'مشحون' AND Date >= DATEADD(month, -1, GETDATE()) AND Date < GETDATE()"
            date_format = "FORMAT(Date, 'yyyy-MM-dd')"
            group_by = "FORMAT(Date, 'yyyy-MM-dd')"
            params = {}
        else:
            # Base query for Chinese sales with custom dates
            if period == 'day':
                date_format = "FORMAT(Date, 'yyyy-MM-dd')"
                group_by = "FORMAT(Date, 'yyyy-MM-dd')"
            else:  # default month format
                date_format = "FORMAT(Date, 'yyyy-MM')"
                group_by = "FORMAT(Date, 'yyyy-MM')"
            
            # Build where clause
            where_clause = "WHERE Status = 'مشحون'"
            params = {}
            
            if start_date:
                where_clause += " AND Date >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date <= :end_date"
                params['end_date'] = end_date
        
        # Query for top products with Type and Color
        sql_query = text(f"""
            SELECT TOP {limit}
                Type,
                Color,
                COUNT(*) as total_pieces,
                SUM(Long) as total_meters,
                COUNT(DISTINCT Customer) as unique_customers
            FROM Chines {where_clause}
            GROUP BY Type, Color
            ORDER BY COUNT(*) DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert results
        products = []
        total_pieces_sum = sum(row[2] for row in rows) if rows else 1  # Avoid division by zero
        
        for row in rows:
            pieces = row[2] if len(row) > 2 else 0
            products.append({
                'type': row[0] if row[0] else '',
                'color': row[1] if len(row) > 1 and row[1] else '',
                'total_pieces': pieces,
                'total_meters': float(row[3]) if len(row) > 3 and row[3] else 0.0,
                'unique_customers': row[4] if len(row) > 4 else 0,
                'percentage': round((pieces / total_pieces_sum) * 100, 1) if total_pieces_sum > 0 else 0
            })
        
        return jsonify({
            'success': True,
            'data': products,
            'count': len(products),
            'total_pieces': total_pieces_sum
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/main/detailed', methods=['GET'])
def get_main_sales_detailed():
    """Get detailed Main sales data using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')
        limit = request.args.get('limit', 1000, type=int)
        
        # Build where clause for filtering
        where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000'"
        params = {}
        
        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND CONVERT(date, Date3) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(week, -1, GETDATE()) AND Date3 < GETDATE()"
        else:
            # Use traditional date filters
            if start_date:
                where_clause += " AND Date3 >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date3 <= :end_date"
                params['end_date'] = end_date
        
        # Your exact query structure with additional filtering based on the provided SQL
        sql_query = text(f"""
            SELECT TOP {limit}
                Main.Number, Main.Desan, Main.Color, Main.Long2, Main.Date3, Main.customerNumber, Customers.Name
            FROM Main 
            JOIN Customers ON Main.customerNumber = Customers.Number
            {where_clause}
            ORDER BY Main.Date3 DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        sales_data = []
        for row in rows:
            sales_data.append({
                'number': row[0] if row[0] else '',
                'desan': row[1] if len(row) > 1 and row[1] else '',
                'color': row[2] if len(row) > 2 and row[2] else '',
                'length': float(row[3]) if len(row) > 3 and row[3] else 0.0,
                'date': row[4].strftime('%Y-%m-%d') if len(row) > 4 and row[4] else '',
                'customer_number': row[5] if len(row) > 5 and row[5] else '',
                'customer_name': row[6] if len(row) > 6 and row[6] else ''
            })
        
        return jsonify({
            'success': True,
            'data': sales_data,
            'count': len(sales_data),
            'query_used': 'SELECT Main.Number, Main.Desan, Main.Color, Main.Long2, Main.Date3, Main.customerNumber, Customers.Name FROM Main JOIN Customers WHERE Status = "مشحون" AND customerNumber != "6000"'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/main/customers', methods=['GET'])
def get_main_customer_sales():
    """Get Main sales grouped by customer for analysis"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        limit = request.args.get('limit', 10, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')        # Build where clause
        where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000'"
        params = {}
        
        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND CONVERT(date, Date3) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'last_week' or period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(week, -1, GETDATE()) AND Date3 < GETDATE()"
        elif period == 'last_month' or period == 'month':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(month, -1, GETDATE()) AND Date3 < GETDATE()"
        elif period == 'last_3_months':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(month, -3, GETDATE()) AND Date3 < GETDATE()"
        else:
            # Use traditional date filters
            if start_date:
                where_clause += " AND Date3 >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date3 <= :end_date"
                params['end_date'] = end_date
        
        # Query for customer sales analysis
        sql_query = text(f"""
            SELECT TOP {limit}
                Customers.Name,
                COUNT(*) as total_pieces,
                SUM(Main.Long2) as total_meters,
                COUNT(DISTINCT CONCAT(Main.Desan, '-', Main.Color)) as unique_products
            FROM Main 
            JOIN Customers ON Main.customerNumber = Customers.Number
            {where_clause}
            GROUP BY Customers.Name
            ORDER BY SUM(Main.Long2) DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert results
        customers = []
        
        for row in rows:
            customers.append({
                'customer': row[0] if row[0] else 'غير محدد',
                'total_pieces': row[1] if len(row) > 1 else 0,
                'total_meters': float(row[2]) if len(row) > 2 and row[2] else 0.0,
                'unique_products': row[3] if len(row) > 3 else 0
            })
        
        return jsonify({
            'success': True,
            'data': customers,
            'count': len(customers)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/sales/main/top-products', methods=['GET'])
def get_main_top_products():
    """Get top Main products with Desan and Color breakdown using the provided query logic"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        limit = request.args.get('limit', 10, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period')
        
        # Build where clause based on the provided SQL query
        where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000'"
        params = {}
        
        # Handle special period filters
        if period == 'yesterday':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND CONVERT(date, Date3) = CONVERT(date, DATEADD(day, -1, GETDATE()))"
        elif period == 'last_week' or period == 'week':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(week, -1, GETDATE()) AND Date3 < GETDATE()"
        elif period == 'last_month' or period == 'month':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(month, -1, GETDATE()) AND Date3 < GETDATE()"
        elif period == 'last_3_months':
            where_clause = "WHERE Status = 'مشحون' AND customerNumber != '6000' AND Date3 >= DATEADD(month, -3, GETDATE()) AND Date3 < GETDATE()"
        else:
            # Use traditional date filters
            if start_date:
                where_clause += " AND Date3 >= :start_date"
                params['start_date'] = start_date
            if end_date:
                where_clause += " AND Date3 <= :end_date"
                params['end_date'] = end_date
        
        # Query for top products with Desan and Color (similar to the provided SQL structure)
        sql_query = text(f"""
            SELECT TOP {limit}
                Desan,
                Color,
                COUNT(*) as total_pieces,
                SUM(Long2) as total_meters,
                COUNT(DISTINCT customerNumber) as unique_customers
            FROM Main {where_clause}
            GROUP BY Desan, Color
            ORDER BY COUNT(*) DESC
        """)
        
        result = db.session.execute(sql_query, params)
        rows = result.fetchall()
        
        # Convert results
        products = []
        total_pieces_sum = sum(row[2] for row in rows) if rows else 1  # Avoid division by zero
        
        for row in rows:
            pieces = row[2] if len(row) > 2 else 0
            products.append({
                'type': row[0] if row[0] else '',
                'color': row[1] if len(row) > 1 and row[1] else '',
                'total_pieces': pieces,
                'total_meters': float(row[3]) if len(row) > 3 and row[3] else 0.0,
                'unique_customers': row[4] if len(row) > 4 else 0,
                'percentage': round((pieces / total_pieces_sum) * 100, 1) if total_pieces_sum > 0 else 0
            })
        
        return jsonify({
            'success': True,
            'data': products,
            'count': len(products),
            'total_pieces': total_pieces_sum
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/orders-in-progress', methods=['GET'])
def get_orders_in_progress():
    """Get orders in progress with aggregated status counts and invoice"""
    try:
        db = current_app.extensions['sqlalchemy']
        sql_query = text("""
            SELECT
                Main.Customer,
                Main.customerNumber,
                Customers.name,
                MAX(Main.Invoice) AS Invoice,
                COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END) AS [في مستودع],
                COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END) AS [في تصنيع],
                COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END) AS [في مصبغة],
                COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END) AS [في مستودع الخام],
                COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END) AS [مشحون],
                (COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END)) AS Totals,
                MAX(Main.endDate) AS MaxEndDate
            FROM Main
            JOIN Customers ON Main.customerNumber = Customers.Number
            WHERE Main.Status IN ('مستودع', 'تصنيع', 'مصبغة', 'مشحون', 'مستودع الخام')
              AND Main.customerNumber != '6000'
              AND Main.Customer NOT IN (
                  SELECT Customer FROM Main
                  GROUP BY Customer
                  HAVING COUNT(DISTINCT CASE WHEN Status != 'مشحون' THEN Status END) = 0
              )
            GROUP BY Main.Customer, Main.customerNumber, Customers.name
            ORDER BY MaxEndDate DESC
        """)
        result = db.session.execute(sql_query)
        rows = result.fetchall()

        orders = []
        for row in rows:
            orders.append({
                'customer': row[0] or '',
                'customer_number': row[1] or '',
                'customer_name': row[2] or '',
                'invoice': row[3] or '',
                'في_مستودع': row[4] or 0,
                'في_تصنيع': row[5] or 0,
                'في_مصبغة': row[6] or 0,
                'في_مستودع_الخام': row[7] or 0,
                'مشحون': row[8] or 0,
                'totals': row[9] or 0,
                'max_end_date': row[10].isoformat() if row[10] else None
            })

        return jsonify({ 'success': True, 'data': orders }), 200

    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500

@warehouse_bp.route('/orders/late', methods=['GET'])
def get_late_orders():
    """Get late orders - orders that are past their due date and not completed"""
    try:
        db = current_app.extensions['sqlalchemy']
        sql_query = text("""
            SELECT
                Main.Customer,
                Main.customerNumber,
                Customers.name,
                MAX(Main.Invoice) AS Invoice,
                COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END) AS [في مستودع],
                COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END) AS [في تصنيع],
                COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END) AS [في مصبغة],
                COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END) AS [في مستودع الخام],
                COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END) AS [مشحون],
                (COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END)) AS Totals,
                MAX(Main.endDate) AS MaxEndDate
            FROM Main
            JOIN Customers ON Main.customerNumber = Customers.Number
            WHERE Main.Status IN ('مستودع', 'تصنيع', 'مصبغة', 'مشحون', 'مستودع الخام')
              AND Main.customerNumber != '6000'
              AND Main.Customer NOT IN (
                  SELECT Customer FROM Main
                  WHERE customerNumber != '6000'
                  GROUP BY Customer
                  HAVING COUNT(DISTINCT CASE WHEN Status != 'مشحون' THEN Status END) = 0
              )
            GROUP BY Main.Customer, Main.customerNumber, Customers.name
            HAVING MAX(Main.endDate) < GETDATE()  -- Only late orders
              AND (COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END) > 0 
                   OR COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END) > 0 
                   OR COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END) > 0)  -- Not completed orders
            ORDER BY MaxEndDate DESC
        """)
        result = db.session.execute(sql_query)
        rows = result.fetchall()

        orders = []
        for row in rows:
            orders.append({
                'customer': row[0] or '',
                'customer_number': row[1] or '',
                'customer_name': row[2] or '',
                'invoice': row[3] or '',
                'في_مستودع': row[4] or 0,
                'في_تصنيع': row[5] or 0,
                'في_مصبغة': row[6] or 0,
                'في_مستودع_الخام': row[7] or 0,
                'مشحون': row[8] or 0,
                'totals': row[9] or 0,
                'max_end_date': row[10].isoformat() if row[10] else None
            })

        return jsonify({ 'success': True, 'data': orders }), 200

    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500

@warehouse_bp.route('/orders/all', methods=['GET'])
def get_all_orders():
    """Get all orders data from multiple sources using various SQL queries"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Query to get all orders with their status
        sql_query = text("""
            SELECT 
                Customer as customer,
                Desan as desan,
                Long as length,
                Date1 as order_date,
                Date2 as start_date,
                Date3 as end_date,
                في_تصنيع as in_manufacturing,
                في_مصبغة as in_dyeing,
                في_مستودع_الخام as in_raw_warehouse,
                Status as status
            FROM Main
            ORDER BY Date1 DESC
        """)
        
        # Execute the query
        result = db.session.execute(sql_query)
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        orders = []
        for row in rows:
            order = {
                'customer': row[0] if row[0] else '',
                'desan': row[1] if row[1] else '',
                'length': float(row[2]) if row[2] else 0.0,
                'order_date': row[3].strftime('%Y-%m-%d') if row[3] else '',
                'start_date': row[4].strftime('%Y-%m-%d') if row[4] else '',
                'end_date': row[5].strftime('%Y-%m-%d') if row[5] else '',
                'in_manufacturing': row[6] if row[6] is not None else 0,
                'in_dyeing': row[7] if row[7] is not None else 0,
                'in_raw_warehouse': row[8] if row[8] is not None else 0,
                'status': row[9] if row[9] else ''
            }
            orders.append(order)
        
        return jsonify({
            'success': True,
            'data': orders,
            'count': len(orders)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/orders/summary', methods=['GET'])
def get_orders_summary():
    """Get summary statistics for orders"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Query to get order summary with enhanced calculations
        sql_query = text("""
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN Status = 'مكتمل' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN في_تصنيع > 0 OR في_مصبغة > 0 OR في_مستودع_الخام > 0 THEN 1 ELSE 0 END) as in_progress_orders,
                MAX(Date3) as max_end_date,
                COUNT(DISTINCT Customer) as unique_customers,
                SUM(Long) as total_length
            FROM Main
        """)
        
        # Execute the query
        result = db.session.execute(sql_query)
        row = result.fetchone()
        
        if row:
            summary = {
                'total_orders': row[0] if row[0] else 0,
                'completed_orders': row[1] if row[1] else 0,
                'in_progress_orders': row[2] if row[2] else 0,
                'max_end_date': row[3].strftime('%Y-%m-%d') if row[3] else '',
                'unique_customers': row[4] if row[4] else 0,
                'total_length': float(row[5]) if row[5] else 0.0
            }
        else:
            summary = {
                'total_orders': 0,
                'completed_orders': 0,
                'in_progress_orders': 0,
                'max_end_date': '',
                'unique_customers': 0,
                'total_length': 0.0
            }
        
        return jsonify({
            'success': True,
            'data': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/classic/details/<desan>', methods=['GET'])
def get_classic_warehouse_details(desan):
    """Get classic warehouse details by desan using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query using the provided format with desan parameter
        sql_query = text("SELECT Desan, Color, COUNT(*) as Desan_Count, Format(SUM(Long2), 'N1') AS TotalLong FROM Main WHERE Status = 'مستودع' and Customer = '6000' and customerNumber = '6000' AND Desan = :desan GROUP BY Desan, Color ORDER BY Color DESC")
        
        # Execute the query with the desan parameter
        result = db.session.execute(sql_query, {'desan': desan})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'desan': row[0] if row[0] else '',
                'color': row[1] if row[1] else '',
                'desan_count': row[2] if len(row) > 2 else 0,
                'total_long': row[3] if len(row) > 3 else '0.0'
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'classic',
            'desan': desan,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/classic/color-details/<desan>/<color>', methods=['GET'])
def get_classic_color_details(desan, color):
    """Get classic warehouse color details by desan and color using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query using the provided format with desan and color parameters
        sql_query = text("SELECT Number, Long2, Date3, Nots FROM Main WHERE Status = 'مستودع' AND Customer = '6000' and customerNumber = '6000' AND Desan = :desan AND Color = :color ORDER BY Number DESC")
        
        # Execute the query with the desan and color parameters
        result = db.session.execute(sql_query, {'desan': desan, 'color': color})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'number': row[0] if row[0] else '',
                'long2': float(row[1]) if row[1] else 0.0,
                'date3': row[2].strftime('%Y-%m-%d') if row[2] else '',
                'notes': row[3] if row[3] else ''
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'classic',
            'desan': desan,
            'color': color,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/scrap/details/<desan>', methods=['GET'])
def get_scrap_warehouse_details(desan):
    """Get scrap warehouse details by desan using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query using the provided format with desan parameter
        sql_query = text("SELECT Desan, Color, COUNT(*) as Desan_Count, Format(SUM(Long2), 'N1') AS TotalLong FROM Main WHERE Status = 'سقط' AND Desan = :desan GROUP BY Desan, Color ORDER BY Color DESC")
        
        # Execute the query with the desan parameter
        result = db.session.execute(sql_query, {'desan': desan})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'desan': row[0] if row[0] else '',
                'color': row[1] if row[1] else '',
                'desan_count': row[2] if len(row) > 2 else 0,
                'total_long': row[3] if len(row) > 3 else '0.0'
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'scrap',
            'desan': desan,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/scrap/color-details/<desan>/<color>', methods=['GET'])
def get_scrap_color_details(desan, color):
    """Get scrap warehouse color details by desan and color"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query for Level 3 scrap warehouse details
        sql_query = text("SELECT Number, Long2, Date3, Nots FROM Main WHERE Status = 'سقط' AND Desan = :desan AND Color = :color ORDER BY Number DESC")
        
        # Execute the query with the desan and color parameters
        result = db.session.execute(sql_query, {'desan': desan, 'color': color})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'number': row[0] if row[0] else '',
                'long2': float(row[1]) if row[1] else 0.0,
                'date3': row[2].strftime('%Y-%m-%d') if row[2] else '',
                'notes': row[3] if row[3] else ''
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'scrap',
            'desan': desan,
            'color': color,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/chinese/details/<type>', methods=['GET'])
def get_chinese_warehouse_details(type):
    """Get Chinese warehouse details by type using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query using the provided format with type parameter
        sql_query = text("SELECT Color, COUNT(*) as Count FROM Chines WHERE Type = :type AND Status = 'مستودع' GROUP BY Color ORDER BY Color")
        
        # Execute the query with the type parameter
        result = db.session.execute(sql_query, {'type': type})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'type': type,  # Include the type for consistency
                'color': row[0] if row[0] else '',
                'count': row[1] if len(row) > 1 else 0
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'chinese',
            'type': type,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/chinese/color-details/<type>/<color>', methods=['GET'])
def get_chinese_color_details(type, color):
    """Get Chinese warehouse color details by type and color using the provided SQL query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # SQL query using the provided format with type and color parameters
        sql_query = text("SELECT Number, Color, Type, Long FROM Chines WHERE Type = :type AND Color = :color AND Status = 'مستودع' ORDER BY Number")
        
        # Execute the query with the type and color parameters
        result = db.session.execute(sql_query, {'type': type, 'color': color})
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        details = []
        for row in rows:
            detail = {
                'number': row[0] if row[0] else '',
                'color': row[1] if row[1] else '',
                'type': row[2] if row[2] else '',
                'long': float(row[3]) if row[3] else 0.0
            }
            details.append(detail)
        
        return jsonify({
            'success': True,
            'data': details,
            'warehouse_type': 'chinese',
            'type': type,
            'color': color,
            'count': len(details)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@warehouse_bp.route('/test-chinese', methods=['GET'])
def test_chinese_connection():
    """Test Chinese table connection and basic query"""
    try:
        # Get database instance from current_app
        db = current_app.extensions['sqlalchemy']
        
        # Simple test query
        sql_query = text("SELECT TOP 5 Type, Color, Long FROM Chines WHERE Status = 'مشحون'")
        
        result = db.session.execute(sql_query)
        rows = result.fetchall()
        
        # Convert results
        test_data = []
        for row in rows:
            test_data.append({
                'type': row[0] if row[0] else '',
                'color': row[1] if len(row) > 1 and row[1] else '',
                'length': float(row[2]) if len(row) > 2 and row[2] else 0.0
            })
        
        return jsonify({
            'success': True,
            'message': 'Chinese table connection successful',
            'sample_data': test_data,
            'count': len(test_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }), 500

@warehouse_bp.route('/orders/ready', methods=['GET'])
def get_ready_orders():
    """Get ready orders - orders that are completed and ready for shipping"""
    try:
        db = current_app.extensions['sqlalchemy']
        sql_query = text("""
            SELECT
                Main.Customer,
                Main.customerNumber,
                Customers.name,
                MAX(Main.Invoice) AS Invoice,
                COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END) AS [في مستودع],
                COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END) AS [في تصنيع],
                COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END) AS [في مصبغة],
                COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END) AS [في مستودع الخام],
                COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END) AS [مشحون],
                (COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END)
                 + COUNT(CASE WHEN Main.Status = 'مشحون' THEN 1 END)) AS Totals,
                MAX(Main.endDate) AS MaxEndDate
            FROM Main
            JOIN Customers ON Main.customerNumber = Customers.Number
            WHERE Main.Status IN ('مستودع', 'تصنيع', 'مصبغة', 'مشحون', 'مستودع الخام')
              AND Main.customerNumber != '6000'
              AND Main.Customer NOT IN (
                  SELECT Customer FROM Main
                  WHERE customerNumber != '6000'
                  GROUP BY Customer
                  HAVING COUNT(DISTINCT CASE WHEN Status != 'مشحون' THEN Status END) = 0
              )
            GROUP BY Main.Customer, Main.customerNumber, Customers.name
            HAVING (COUNT(CASE WHEN Main.Status = 'تصنيع' THEN 1 END) = 0 
                   AND COUNT(CASE WHEN Main.Status = 'مصبغة' THEN 1 END) = 0 
                   AND COUNT(CASE WHEN Main.Status = 'مستودع الخام' THEN 1 END) = 0)  -- Completed orders only
              AND COUNT(CASE WHEN Main.Status = 'مستودع' THEN 1 END) > 0  -- Has items in warehouse
            ORDER BY MaxEndDate DESC
        """)
        result = db.session.execute(sql_query)
        rows = result.fetchall()

        orders = []
        for row in rows:
            orders.append({
                'customer': row[0] or '',
                'customer_number': row[1] or '',
                'customer_name': row[2] or '',
                'invoice': row[3] or '',
                'في_مستودع': row[4] or 0,
                'في_تصنيع': row[5] or 0,
                'في_مصبغة': row[6] or 0,
                'في_مستودع_الخام': row[7] or 0,
                'مشحون': row[8] or 0,
                'totals': row[9] or 0,                'max_end_date': row[10].isoformat() if row[10] else None
            })

        print(f"Ready Orders: Found {len(orders)} orders")  # Debug log
        if orders:
            print(f"Sample invoice values: {[order['invoice'] for order in orders[:3]]}")  # Debug log

        return jsonify({ 'success': True, 'data': orders }), 200

    except Exception as e:
        print(f"Error in get_ready_orders: {str(e)}")
        return jsonify({ 'success': False, 'error': str(e) }), 500